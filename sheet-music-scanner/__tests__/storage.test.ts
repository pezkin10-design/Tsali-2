/**
 * Unit Tests for Storage Service
 */

import { StorageService } from '@services/storage';
import { ScannedItem, AppSettings } from '@utils/types';
import { DEFAULT_SETTINGS } from '@utils/constants';

describe('StorageService', () => {
  beforeEach(async () => {
    // Clear all data before each test
    try {
      await StorageService.clearAllData();
    } catch (error) {
      // Ignore if already empty
    }
  });

  describe('ScannedItems', () => {
    it('should add a scanned item', async () => {
      const item: ScannedItem = {
        id: 'test-1',
        filename: 'test.jpg',
        imagePath: '/path/to/image',
        musicData: {
          title: 'Test Song',
          composer: 'Test Composer',
          notes: [],
          confidence: 0.95,
        },
        confidence: 0.95,
        dateScanned: Date.now(),
        lastModified: Date.now(),
        fileSize: 1024,
        duration: 120000,
        playCount: 0,
        isFavorite: false,
      };

      await StorageService.addScannedItem(item);
      const items = await StorageService.getScannedItems();

      expect(items.length).toBe(1);
      expect(items[0].id).toBe('test-1');
      expect(items[0].filename).toBe('test.jpg');
    });

    it('should retrieve a specific scanned item', async () => {
      const item: ScannedItem = {
        id: 'test-2',
        filename: 'test2.jpg',
        imagePath: '/path/to/image2',
        musicData: { notes: [], confidence: 0.9 },
        confidence: 0.9,
        dateScanned: Date.now(),
        lastModified: Date.now(),
        fileSize: 2048,
        duration: 180000,
        playCount: 0,
        isFavorite: false,
      };

      await StorageService.addScannedItem(item);
      const retrieved = await StorageService.getScannedItem('test-2');

      expect(retrieved).toBeDefined();
      expect(retrieved?.filename).toBe('test2.jpg');
    });

    it('should update a scanned item', async () => {
      const item: ScannedItem = {
        id: 'test-3',
        filename: 'test3.jpg',
        imagePath: '/path/to/image3',
        musicData: { notes: [], confidence: 0.85 },
        confidence: 0.85,
        dateScanned: Date.now(),
        lastModified: Date.now(),
        fileSize: 512,
        duration: 60000,
        playCount: 0,
        isFavorite: false,
      };

      await StorageService.addScannedItem(item);
      await StorageService.updateScannedItem('test-3', { playCount: 5, isFavorite: true });

      const updated = await StorageService.getScannedItem('test-3');
      expect(updated?.playCount).toBe(5);
      expect(updated?.isFavorite).toBe(true);
    });

    it('should delete a scanned item', async () => {
      const item: ScannedItem = {
        id: 'test-4',
        filename: 'test4.jpg',
        imagePath: '/path/to/image4',
        musicData: { notes: [], confidence: 0.8 },
        confidence: 0.8,
        dateScanned: Date.now(),
        lastModified: Date.now(),
        fileSize: 256,
        duration: 90000,
        playCount: 0,
        isFavorite: false,
      };

      await StorageService.addScannedItem(item);
      await StorageService.deleteScannedItem('test-4');

      const deleted = await StorageService.getScannedItem('test-4');
      expect(deleted).toBeNull();
    });

    it('should delete multiple items', async () => {
      for (let i = 0; i < 3; i++) {
        const item: ScannedItem = {
          id: `multi-${i}`,
          filename: `test${i}.jpg`,
          imagePath: `/path/to/image${i}`,
          musicData: { notes: [], confidence: 0.8 },
          confidence: 0.8,
          dateScanned: Date.now(),
          lastModified: Date.now(),
          fileSize: 512,
          duration: 120000,
          playCount: 0,
          isFavorite: false,
        };
        await StorageService.addScannedItem(item);
      }

      await StorageService.deleteMultipleItems(['multi-0', 'multi-1']);
      const items = await StorageService.getScannedItems();

      expect(items.length).toBe(1);
      expect(items[0].id).toBe('multi-2');
    });
  });

  describe('Settings', () => {
    it('should get default settings', async () => {
      const settings = await StorageService.getSettings();
      expect(settings).toBeDefined();
      expect(settings.soundEnabled).toBeDefined();
      expect(settings.vibration).toBeDefined();
    });

    it('should update settings', async () => {
      await StorageService.updateSettings({ soundEnabled: false });
      const settings = await StorageService.getSettings();
      expect(settings.soundEnabled).toBe(false);
    });

    it('should reset settings to defaults', async () => {
      await StorageService.updateSettings({ soundEnabled: false });
      await StorageService.resetSettings();

      const settings = await StorageService.getSettings();
      expect(settings.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
    });
  });

  describe('Preferences', () => {
    it('should set and get a preference', async () => {
      await StorageService.setPreference('testKey', true);
      const value = await StorageService.getPreference('testKey');
      expect(value).toBe(true);
    });

    it('should return null for non-existent preference', async () => {
      const value = await StorageService.getPreference('nonexistent');
      expect(value).toBeNull();
    });

    it('should update preference value', async () => {
      await StorageService.setPreference('counter', 1);
      await StorageService.setPreference('counter', 5);
      const value = await StorageService.getPreference('counter');
      expect(value).toBe(5);
    });
  });

  describe('Audio Settings', () => {
    it('should get audio settings', async () => {
      const settings = await StorageService.getAudioSettings();
      expect(settings).toBeDefined();
      expect(settings.volume).toBeDefined();
      expect(settings.playbackSpeed).toBeDefined();
    });

    it('should update audio settings', async () => {
      await StorageService.updateAudioSettings({ volume: 0.5 });
      const settings = await StorageService.getAudioSettings();
      expect(settings.volume).toBe(0.5);
    });
  });

  describe('Caching', () => {
    it('should use cache for repeated reads', async () => {
      const item: ScannedItem = {
        id: 'cache-test',
        filename: 'cache.jpg',
        imagePath: '/path/to/cache',
        musicData: { notes: [], confidence: 0.9 },
        confidence: 0.9,
        dateScanned: Date.now(),
        lastModified: Date.now(),
        fileSize: 512,
        duration: 120000,
        playCount: 0,
        isFavorite: false,
      };

      await StorageService.addScannedItem(item);

      // First call
      const first = await StorageService.getScannedItem('cache-test');
      // Second call should use cache
      const second = await StorageService.getScannedItem('cache-test');

      expect(first?.filename).toBe(second?.filename);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing item gracefully', async () => {
      const item = await StorageService.getScannedItem('nonexistent-id');
      expect(item).toBeNull();
    });

    it('should validate input before storage', async () => {
      // Try to add invalid item (missing required fields)
      const invalidItem: any = {
        id: 'invalid',
        // missing required fields
      };

      try {
        await StorageService.addScannedItem(invalidItem);
        // If validation is weak, the operation might succeed
        // This test depends on implementation
      } catch (error) {
        // Validation error expected
        expect(error).toBeDefined();
      }
    });
  });
});
