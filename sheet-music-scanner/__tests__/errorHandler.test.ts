/**
 * Unit Tests for Error Handler
 */

import { ErrorHandler, ErrorCategory, AppError } from '@services/utils/errorHandler';

describe('ErrorHandler', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(
        'Test error',
        ErrorCategory.STORAGE,
        'error',
        { originalError: 'test' }
      );

      expect(error.message).toBe('Test error');
      expect(error.category).toBe(ErrorCategory.STORAGE);
      expect(error.severity).toBe('error');
      expect(error.details).toEqual({ originalError: 'test' });
    });

    it('should have default severity INFO', () => {
      const error = new AppError('Test', ErrorCategory.UNKNOWN);
      expect(error.severity).toBe('info');
    });

    it('should have correct user message', () => {
      const error = new AppError('Technical error', ErrorCategory.STORAGE);
      expect(error.userMessage).toBe('A storage error occurred. Please try again.');
    });
  });

  describe('ErrorHandler.handle', () => {
    it('should categorize network errors', () => {
      const networkError = new Error('Network timeout');
      const handled = ErrorHandler.handle(networkError, ErrorCategory.NETWORK);
      expect(handled.category).toBe(ErrorCategory.NETWORK);
    });

    it('should categorize storage errors', () => {
      const storageError = new Error('Failed to write to storage');
      const handled = ErrorHandler.handle(storageError, ErrorCategory.STORAGE);
      expect(handled.category).toBe(ErrorCategory.STORAGE);
    });

    it('should convert string errors to AppError', () => {
      const handled = ErrorHandler.handle('Simple string error');
      expect(handled).toBeInstanceOf(AppError);
      expect(handled.message).toBe('Simple string error');
    });

    it('should convert object errors to AppError', () => {
      const handled = ErrorHandler.handle({ error: 'test' });
      expect(handled).toBeInstanceOf(AppError);
    });
  });

  describe('ErrorHandler.getLogs', () => {
    it('should return array of error logs', () => {
      ErrorHandler.clearLogs();
      ErrorHandler.handle('Test error 1', ErrorCategory.STORAGE);
      ErrorHandler.handle('Test error 2', ErrorCategory.NETWORK);

      const logs = ErrorHandler.getLogs();
      expect(logs.length).toBe(2);
      expect(logs[0].message).toBe('Test error 1');
    });

    it('should limit logs to recent entries', () => {
      ErrorHandler.clearLogs();
      for (let i = 0; i < 150; i++) {
        ErrorHandler.handle(`Error ${i}`, ErrorCategory.UNKNOWN);
      }

      const logs = ErrorHandler.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('ErrorHandler.getLogsByCategory', () => {
    it('should filter logs by category', () => {
      ErrorHandler.clearLogs();
      ErrorHandler.handle('Network error', ErrorCategory.NETWORK);
      ErrorHandler.handle('Storage error', ErrorCategory.STORAGE);
      ErrorHandler.handle('Another network error', ErrorCategory.NETWORK);

      const networkLogs = ErrorHandler.getLogsByCategory(ErrorCategory.NETWORK);
      expect(networkLogs.length).toBe(2);
      expect(networkLogs.every(log => log.category === ErrorCategory.NETWORK)).toBe(true);
    });
  });

  describe('ErrorHandler.getLogsBySeverity', () => {
    it('should filter logs by severity', () => {
      ErrorHandler.clearLogs();
      const error1 = new AppError('Critical', ErrorCategory.ML_MODEL, 'critical');
      const error2 = new AppError('Warning', ErrorCategory.VALIDATION, 'warning');

      ErrorHandler.handle(error1);
      ErrorHandler.handle(error2);

      const criticalLogs = ErrorHandler.getLogsBySeverity('critical');
      expect(criticalLogs.length).toBe(1);
      expect(criticalLogs[0].severity).toBe('critical');
    });
  });

  describe('ErrorHandler.withRetry', () => {
    it('should retry failed operations', async () => {
      let attemptCount = 0;
      const operation = async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };

      const result = await ErrorHandler.withRetry(operation, { maxAttempts: 3 });
      expect(result).toBe('success');
      expect(attemptCount).toBe(2);
    });

    it('should throw after max attempts', async () => {
      const operation = async () => {
        throw new Error('Persistent failure');
      };

      try {
        await ErrorHandler.withRetry(operation, { maxAttempts: 2 });
        fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Persistent failure');
      }
    });

    it('should apply exponential backoff', async () => {
      const timestamps: number[] = [];
      let attemptCount = 0;

      const operation = async () => {
        timestamps.push(Date.now());
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Failure');
        }
        return 'success';
      };

      await ErrorHandler.withRetry(operation, { maxAttempts: 3, initialDelay: 10 });

      if (timestamps.length >= 2) {
        const delay = timestamps[1] - timestamps[0];
        expect(delay).toBeGreaterThanOrEqual(10);
      }
    });
  });

  describe('ErrorHandler.withTimeout', () => {
    it('should resolve before timeout', async () => {
      const result = await ErrorHandler.withTimeout(
        async () => 'success',
        1000
      );
      expect(result).toBe('success');
    });

    it('should throw TimeoutError when exceeded', async () => {
      try {
        await ErrorHandler.withTimeout(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return 'success';
          },
          100
        );
        fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('timeout');
      }
    });
  });
});
