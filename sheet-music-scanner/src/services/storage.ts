import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannedItem, AppSettings } from '@utils/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@utils/constants';
import {
  ErrorHandler,
  ErrorCategory,
  ErrorSeverity,
  AppError,
  withRetry,
} from '@utils/errorHandler';
import { PerformanceMonitor } from '@utils/performanceMonitor';

/**
 * Storage Service with Enhanced Error Handling and Performance
 */
export class StorageService {
  private static itemsCache: ScannedItem[] | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Get all scanned items with caching and error handling
   */
  static async getScannedItems(): Promise<ScannedItem[]> {
    const timerId = PerformanceMonitor.startOperationWithId('getScannedItems', 'fetch');

    try {
      // Check cache
      const now = Date.now();
      if (this.itemsCache && now - this.cacheTimestamp < this.CACHE_TTL) {
        PerformanceMonitor.endOperationWithId(timerId, { source: 'cache' });
        return this.itemsCache;
      }

      const items = await withRetry(
        async () => {
          const data = await AsyncStorage.getItem(STORAGE_KEYS.SCANNED_ITEMS);
          return data ? JSON.parse(data) : [];
        },
        2,
        100,
        ErrorCategory.STORAGE
      );

      // Update cache
      this.itemsCache = items;
      this.cacheTimestamp = Date.now();

      PerformanceMonitor.endOperationWithId(timerId, { source: 'storage', itemCount: items.length });
      return items;
    } catch (error) {
      PerformanceMonitor.endOperationWithId(timerId, { error: true });
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.error('Error fetching scanned items:', appError.userMessage);
      return [];
    }
  }

  /**
   * Add scanned item with validation and error handling
   */
  static async addScannedItem(item: ScannedItem): Promise<void> {
    const timerId = PerformanceMonitor.startOperationWithId('addScannedItem', item.id);

    try {
      // Validate item
      if (!item.id || !item.filename) {
        throw new AppError(
          'Invalid item: missing required fields',
          ErrorSeverity.ERROR,
          ErrorCategory.VALIDATION,
          'Invalid data provided'
        );
      }

      const items = await this.getScannedItems();
      items.unshift(item);

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.SCANNED_ITEMS, JSON.stringify(items)),
        2,
        100,
        ErrorCategory.STORAGE
      );

      // Invalidate cache
      this.itemsCache = items;
      this.cacheTimestamp = Date.now();

      PerformanceMonitor.endOperationWithId(timerId);
    } catch (error) {
      PerformanceMonitor.endOperationWithId(timerId, { error: true });
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Update scanned item with optimistic updates
   */
  static async updateScannedItem(itemId: string, updates: Partial<ScannedItem>): Promise<void> {
    const timerId = PerformanceMonitor.startOperationWithId('updateScannedItem', itemId);

    try {
      const items = await this.getScannedItems();
      const index = items.findIndex((item) => item.id === itemId);

      if (index === -1) {
        throw new AppError(
          `Item not found: ${itemId}`,
          ErrorSeverity.WARNING,
          ErrorCategory.VALIDATION,
          'Item not found'
        );
      }

      items[index] = { ...items[index], ...updates };

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.SCANNED_ITEMS, JSON.stringify(items)),
        2,
        100,
        ErrorCategory.STORAGE
      );

      // Update cache
      this.itemsCache = items;
      this.cacheTimestamp = Date.now();

      PerformanceMonitor.endOperationWithId(timerId);
    } catch (error) {
      PerformanceMonitor.endOperationWithId(timerId, { error: true });
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Delete scanned item with batch optimization
   */
  static async deleteScannedItem(itemId: string): Promise<void> {
    const timerId = PerformanceMonitor.startOperationWithId('deleteScannedItem', itemId);

    try {
      const items = await this.getScannedItems();
      const filtered = items.filter((item) => item.id !== itemId);

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.SCANNED_ITEMS, JSON.stringify(filtered)),
        2,
        100,
        ErrorCategory.STORAGE
      );

      // Update cache
      this.itemsCache = filtered;
      this.cacheTimestamp = Date.now();

      PerformanceMonitor.endOperationWithId(timerId);
    } catch (error) {
      PerformanceMonitor.endOperationWithId(timerId, { error: true });
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Get single scanned item with caching
   */
  static async getScannedItem(itemId: string): Promise<ScannedItem | null> {
    const timerId = PerformanceMonitor.startOperationWithId('getScannedItem', itemId);

    try {
      const items = await this.getScannedItems();
      const item = items.find((item) => item.id === itemId) || null;
      PerformanceMonitor.endOperationWithId(timerId, { found: !!item });
      return item;
    } catch (error) {
      PerformanceMonitor.endOperationWithId(timerId, { error: true });
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.error('Error fetching scanned item:', appError.userMessage);
      return null;
    }
  }

  /**
   * Delete multiple items efficiently
   */
  static async deleteMultipleItems(itemIds: string[]): Promise<void> {
    const timerId = PerformanceMonitor.startOperationWithId('deleteMultipleItems', `batch-${itemIds.length}`);

    try {
      if (!itemIds || itemIds.length === 0) {
        PerformanceMonitor.endOperationWithId(timerId, { itemCount: 0 });
        return;
      }

      const items = await this.getScannedItems();
      const idSet = new Set(itemIds);
      const filtered = items.filter((item) => !idSet.has(item.id));

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.SCANNED_ITEMS, JSON.stringify(filtered)),
        2,
        100,
        ErrorCategory.STORAGE
      );

      // Update cache
      this.itemsCache = filtered;
      this.cacheTimestamp = Date.now();

      PerformanceMonitor.endOperationWithId(timerId, { deletedCount: itemIds.length });
    } catch (error) {
      PerformanceMonitor.endOperationWithId(timerId, { error: true });
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Get settings with fallback to defaults
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.warn('Error fetching settings, using defaults:', appError.userMessage);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update settings safely
   */
  static async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...updates };

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated)),
        2,
        100,
        ErrorCategory.STORAGE
      );
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Get user preference
   */
  static async getPreference(key: string): Promise<any> {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      const prefs = preferences ? JSON.parse(preferences) : {};
      return prefs[key] ?? null;
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.warn('Error fetching preference:', appError.userMessage);
      return null;
    }
  }

  /**
   * Set user preference
   */
  static async setPreference(key: string, value: any): Promise<void> {
    try {
      const preferences = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      const prefs = preferences ? JSON.parse(preferences) : {};
      prefs[key] = value;

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs)),
        2,
        100,
        ErrorCategory.STORAGE
      );
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Get audio settings
   */
  static async getAudioSettings(): Promise<Record<string, any>> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.AUDIO_SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.warn('Error fetching audio settings:', appError.userMessage);
      return {};
    }
  }

  /**
   * Update audio settings
   */
  static async updateAudioSettings(updates: Record<string, any>): Promise<void> {
    try {
      const current = await this.getAudioSettings();
      const updated = { ...current, ...updates };

      await withRetry(
        () => AsyncStorage.setItem(STORAGE_KEYS.AUDIO_SETTINGS, JSON.stringify(updated)),
        2,
        100,
        ErrorCategory.STORAGE
      );
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Clear all data with confirmation
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      this.itemsCache = null;
      this.cacheTimestamp = 0;
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      throw appError;
    }
  }

  /**
   * Invalidate cache (call after major updates)
   */
  static invalidateCache(): void {
    this.itemsCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { isCached: boolean; age: number } {
    const now = Date.now();
    return {
      isCached: this.itemsCache !== null && now - this.cacheTimestamp < this.CACHE_TTL,
      age: now - this.cacheTimestamp,
    };
  }
}

export default StorageService;
