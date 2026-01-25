/**
 * Unit Tests for Performance Monitor
 */

import { PerformanceMonitor } from '@utils/performanceMonitor';

describe('PerformanceMonitor', () => {
  const monitor = new PerformanceMonitor();

  beforeEach(() => {
    monitor.clearMetrics();
  });

  describe('startOperation and endOperation', () => {
    it('should measure simple operation duration', () => {
      monitor.startOperation('testOp');
      setTimeout(() => {
        monitor.endOperation('testOp');
      }, 10);

      // Give it time to complete
      return new Promise(resolve => {
        setTimeout(() => {
          const stats = monitor.getStats('testOp');
          expect(stats).toBeDefined();
          expect(stats!.count).toBe(1);
          expect(stats!.totalDuration).toBeGreaterThanOrEqual(10);
          resolve(true);
        }, 50);
      });
    });

    it('should track multiple operations', () => {
      monitor.startOperation('op1');
      monitor.endOperation('op1');
      
      monitor.startOperation('op2');
      monitor.endOperation('op2');

      const stats1 = monitor.getStats('op1');
      const stats2 = monitor.getStats('op2');

      expect(stats1?.count).toBe(1);
      expect(stats2?.count).toBe(1);
    });

    it('should accumulate multiple calls to same operation', () => {
      monitor.startOperation('repeated');
      monitor.endOperation('repeated');

      monitor.startOperation('repeated');
      monitor.endOperation('repeated');

      const stats = monitor.getStats('repeated');
      expect(stats?.count).toBe(2);
    });
  });

  describe('measure', () => {
    it('should measure synchronous function', () => {
      const result = monitor.measure('sync-op', () => {
        return 'result';
      });

      expect(result).toBe('result');
      expect(monitor.getStats('sync-op')?.count).toBe(1);
    });

    it('should measure and return result', () => {
      const result = monitor.measure('calc', () => 2 + 2);
      expect(result).toBe(4);
    });
  });

  describe('getStats', () => {
    it('should return null for non-existent operation', () => {
      const stats = monitor.getStats('nonexistent');
      expect(stats).toBeNull();
    });

    it('should calculate average duration', () => {
      monitor.startOperation('timed');
      monitor.endOperation('timed');

      monitor.startOperation('timed');
      monitor.endOperation('timed');

      const stats = monitor.getStats('timed');
      expect(stats?.avgDuration).toBeDefined();
      expect(stats?.avgDuration).toBeGreaterThan(0);
    });

    it('should track min and max duration', () => {
      monitor.startOperation('range');
      monitor.endOperation('range');

      const stats = monitor.getStats('range');
      expect(stats?.minDuration).toBeLessThanOrEqual(stats!.maxDuration);
    });
  });

  describe('generateReport', () => {
    it('should generate performance report', () => {
      monitor.startOperation('op1');
      monitor.endOperation('op1');

      monitor.startOperation('op2');
      monitor.endOperation('op2');

      const report = monitor.generateReport();
      expect(report).toContain('Performance Report');
      expect(report).toContain('op1');
      expect(report).toContain('op2');
    });

    it('should include statistics in report', () => {
      monitor.startOperation('test');
      monitor.endOperation('test');

      const report = monitor.generateReport();
      expect(report).toContain('Count:');
      expect(report).toContain('Total Duration:');
      expect(report).toContain('Average Duration:');
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      monitor.startOperation('op1');
      monitor.endOperation('op1');

      expect(monitor.getStats('op1')).toBeDefined();

      monitor.clearMetrics();

      expect(monitor.getStats('op1')).toBeNull();
    });
  });
});

describe('Memoizer', () => {
  it('should cache function results', async () => {
    let callCount = 0;
    const fn = async (x: number) => {
      callCount++;
      return x * 2;
    };

    const memoized = new (require('@utils/performanceMonitor').Memoizer)(fn, 1000);

    const result1 = await memoized.get(5);
    const result2 = await memoized.get(5);

    expect(result1).toBe(10);
    expect(result2).toBe(10);
    expect(callCount).toBe(1); // Called only once
  });

  it('should expire cache entries', async () => {
    let callCount = 0;
    const fn = async (x: number) => {
      callCount++;
      return x * 2;
    };

    const memoized = new (require('@utils/performanceMonitor').Memoizer)(fn, 50);

    await memoized.get(5);
    expect(callCount).toBe(1);

    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 100));

    await memoized.get(5);
    expect(callCount).toBe(2); // Called again after expiry
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const debounced = require('@utils/performanceMonitor').debounce(fn, 50);

    debounced();
    debounced();
    debounced();

    expect(callCount).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(callCount).toBe(1);
  });
});

describe('throttle', () => {
  it('should throttle function calls', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
    };

    const throttled = require('@utils/performanceMonitor').throttle(fn, 50);

    throttled();
    throttled();
    throttled();

    expect(callCount).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 100));

    throttled();
    expect(callCount).toBe(2);
  });
});
