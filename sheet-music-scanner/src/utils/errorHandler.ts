/**
 * Global Error Handler & Logger
 * Provides consistent error handling, logging, and user-facing messages
 */

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  STORAGE = 'storage',
  CAMERA = 'camera',
  ML_MODEL = 'ml_model',
  FILE_SYSTEM = 'file_system',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  details?: any;
  stack?: string;
  userMessage?: string;
}

export class AppError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly userMessage: string;
  public readonly details?: any;

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    userMessage?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.category = category;
    this.userMessage = userMessage || this.getDefaultUserMessage(category);
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private getDefaultUserMessage(category: ErrorCategory): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Network connection error. Please check your internet.',
      [ErrorCategory.STORAGE]: 'Failed to save data. Please try again.',
      [ErrorCategory.CAMERA]: 'Camera error. Please check permissions and try again.',
      [ErrorCategory.ML_MODEL]: 'Music recognition failed. Please try another image.',
      [ErrorCategory.FILE_SYSTEM]: 'File operation failed. Please try again.',
      [ErrorCategory.PERMISSION]: 'Permission denied. Please enable required permissions.',
      [ErrorCategory.VALIDATION]: 'Invalid input. Please check and try again.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    return messages[category];
  }
}

/**
 * Global Error Handler
 */
export class ErrorHandler {
  private static errorLogs: ErrorLog[] = [];
  private static readonly MAX_LOGS = 100;

  /**
   * Log and handle error
   */
  static handle(error: any, defaultCategory: ErrorCategory = ErrorCategory.UNKNOWN): AppError {
    const appError = this.normalize(error, defaultCategory);
    this.log(appError);
    return appError;
  }

  /**
   * Convert any error type to AppError
   */
  static normalize(error: any, defaultCategory: ErrorCategory = ErrorCategory.UNKNOWN): AppError {
    if (error instanceof AppError) {
      return error;
    }

    const category = this.determineCategory(error);
    const message = this.extractMessage(error);
    const stack = error?.stack;

    return new AppError(
      message,
      ErrorSeverity.ERROR,
      category || defaultCategory,
      undefined,
      { originalError: error, stack }
    );
  }

  /**
   * Determine error category from error object
   */
  private static determineCategory(error: any): ErrorCategory | null {
    const message = String(error?.message || error).toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('permission') || message.includes('denied')) {
      return ErrorCategory.PERMISSION;
    }
    if (message.includes('camera')) {
      return ErrorCategory.CAMERA;
    }
    if (message.includes('storage') || message.includes('asyncstorage')) {
      return ErrorCategory.STORAGE;
    }
    if (message.includes('file') || message.includes('filesystem')) {
      return ErrorCategory.FILE_SYSTEM;
    }
    if (message.includes('model') || message.includes('tflite') || message.includes('recognition')) {
      return ErrorCategory.ML_MODEL;
    }
    if (message.includes('invalid') || message.includes('validation')) {
      return ErrorCategory.VALIDATION;
    }

    return null;
  }

  /**
   * Extract meaningful error message
   */
  private static extractMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.toString) return error.toString();
    return 'Unknown error occurred';
  }

  /**
   * Log error for debugging
   */
  private static log(error: AppError): void {
    const log: ErrorLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      severity: error.severity,
      category: error.category,
      message: error.message,
      details: error.details,
      userMessage: error.userMessage,
    };

    this.errorLogs.push(log);

    // Keep only recent logs
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs = this.errorLogs.slice(-this.MAX_LOGS);
    }

    // Console logging with severity
    const logFn = this.getLogFunction(error.severity);
    logFn(`[${error.category}] ${error.message}`, error.details);
  }

  /**
   * Get appropriate console function for severity
   */
  private static getLogFunction(severity: ErrorSeverity): any {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return console.error;
      case ErrorSeverity.ERROR:
        return console.error;
      case ErrorSeverity.WARNING:
        return console.warn;
      case ErrorSeverity.INFO:
        return console.log;
    }
  }

  /**
   * Get all logged errors
   */
  static getLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Get errors by severity
   */
  static getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.errorLogs.filter((log) => log.severity === severity);
  }

  /**
   * Get errors by category
   */
  static getLogsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.errorLogs.filter((log) => log.category === category);
  }

  /**
   * Clear error logs
   */
  static clearLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Export error logs for debugging
   */
  static exportLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }
}

/**
 * Async operation wrapper with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorCategory: ErrorCategory = ErrorCategory.UNKNOWN,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.handle(error, errorCategory);
    return fallbackValue;
  }
}

/**
 * Sync operation wrapper with error handling
 */
export function withErrorHandlingSync<T>(
  operation: () => T,
  errorCategory: ErrorCategory = ErrorCategory.UNKNOWN,
  fallbackValue?: T
): T | undefined {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.handle(error, errorCategory);
    return fallbackValue;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 100,
  errorCategory: ErrorCategory = ErrorCategory.UNKNOWN
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  const appError = ErrorHandler.handle(lastError || new Error('Max retries exceeded'), errorCategory);
  throw appError;
}

/**
 * Timeout wrapper for async operations
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000,
  errorCategory: ErrorCategory = ErrorCategory.UNKNOWN
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(
          new AppError(
            `Operation timed out after ${timeoutMs}ms`,
            ErrorSeverity.ERROR,
            errorCategory,
            'Operation took too long. Please try again.'
          )
        ),
        timeoutMs
      )
    ),
  ]);
}

export default ErrorHandler;
