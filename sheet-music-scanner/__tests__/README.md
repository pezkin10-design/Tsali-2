# Testing Guide for Tsali Scanner

## Overview

This document describes the testing strategy and setup for the Tsali Scanner application. The test suite includes unit tests, integration tests, and performance benchmarks.

## Test Structure

```
__tests__/
├── setup.ts                    # Jest configuration and mocks
├── errorHandler.test.ts        # Error handling utilities tests
├── performanceMonitor.test.ts  # Performance monitoring tests
├── storage.test.ts             # Storage service tests
├── accessibilityUtils.test.ts  # Accessibility utilities tests
├── omr.integration.test.ts     # OMR pipeline integration tests
└── README.md                   # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- errorHandler.test.ts
```

### Generate coverage report
```bash
npm test -- --coverage
```

### Run tests with specific reporter
```bash
npm test -- --reporters=json --outputFile=test-results.json
```

## Test Categories

### 1. Unit Tests

#### Error Handler Tests (`errorHandler.test.ts`)
- **Coverage**: Error categorization, logging, retry logic, timeouts
- **Key Tests**:
  - Error creation and properties
  - Category detection
  - Log retrieval and filtering
  - Retry with exponential backoff
  - Timeout handling

**Example**:
```typescript
const error = new AppError('Test', ErrorCategory.STORAGE);
expect(error.category).toBe(ErrorCategory.STORAGE);
expect(error.userMessage).toContain('storage error');
```

#### Performance Monitor Tests (`performanceMonitor.test.ts`)
- **Coverage**: Operation timing, metrics calculation, caching
- **Key Tests**:
  - Simple operation measurement
  - Multiple operation tracking
  - Statistics calculation (avg, min, max)
  - Report generation
  - Memoization with TTL
  - Debouncing and throttling

**Example**:
```typescript
monitor.startOperation('scan');
// ... perform operation ...
monitor.endOperation('scan');
const stats = monitor.getStats('scan');
expect(stats.avgDuration).toBeGreaterThan(0);
```

#### Storage Service Tests (`storage.test.ts`)
- **Coverage**: CRUD operations, caching, settings management
- **Key Tests**:
  - Add/retrieve/update/delete scanned items
  - Batch operations
  - Settings persistence
  - Preference storage
  - Audio settings management
  - Cache functionality
  - Error handling

**Example**:
```typescript
const item = { id: 'test', filename: 'song.jpg', /* ... */ };
await StorageService.addScannedItem(item);
const retrieved = await StorageService.getScannedItem('test');
expect(retrieved.filename).toBe('song.jpg');
```

#### Accessibility Utilities Tests (`accessibilityUtils.test.ts`)
- **Coverage**: Accessibility properties, contrast calculations, formatting
- **Key Tests**:
  - Button, input, image accessibility labels
  - List item formatting
  - Switch and modal accessibility
  - Contrast ratio calculations
  - WCAG AA compliance verification
  - Duration formatting
  - Test ID generation

**Example**:
```typescript
const props = getButtonAccessibility('Submit');
expect(props.accessibilityRole).toBe('button');
expect(props.accessible).toBe(true);
```

### 2. Integration Tests

#### OMR Pipeline Tests (`omr.integration.test.ts`)
- **Coverage**: End-to-end scanning, storage, and error handling
- **Key Tests**:
  - OMR service initialization
  - Image validation
  - Progress tracking
  - Result storage and retrieval
  - Data integrity through cycles
  - Error handling and retry
  - Full scanning workflow

**Example**:
```typescript
await OMRService.initialize(progressCallback);
const result = await OMRService.scanSheetMusic(imagePath, options);
expect(result.success).toBe(true);
await StorageService.addScannedItem(result.musicData);
```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Branches | 70% | - |
| Functions | 70% | - |
| Lines | 70% | - |
| Statements | 70% | - |

## Mocking Strategy

### Expo Modules
- `expo-camera`: Mocked with default permissions granted
- `expo-haptics`: Mocked to avoid device interaction
- `expo-file-system`: Mocked with cache path
- `expo-sharing`: Mocked to prevent actual file sharing
- `expo-av`: Mocked audio system

### Navigation
- `@react-navigation/native`: Mocked with minimal implementation
- Provides `navigate`, `goBack`, and `setOptions` methods

### Storage
- `@react-native-async-storage/async-storage`: Mocked with Promise-based API

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` and `afterEach` for setup/cleanup
- Clear data between tests

**Example**:
```typescript
beforeEach(async () => {
  await StorageService.clearAllData();
});
```

### 2. Descriptive Test Names
- Use clear, specific descriptions
- Follow pattern: "should [expected behavior] when [condition]"

**Example**:
```typescript
it('should retry failed operations with exponential backoff', async () => {
  // test implementation
});
```

### 3. Assertion Specificity
- Test one thing per assertion when possible
- Use specific matchers

**Example**:
```typescript
expect(error.category).toBe(ErrorCategory.STORAGE);
expect(error.severity).toBe('error');
expect(error.message).toContain('storage');
```

### 4. Async Handling
- Always await promises
- Use `done()` callback for async tests if not using async/await

**Example**:
```typescript
it('should load items', async () => {
  const items = await StorageService.getScannedItems();
  expect(items).toBeDefined();
});
```

## Performance Benchmarks

### Expected Performance

| Operation | Target | Notes |
|-----------|--------|-------|
| OMR Initialization | <5000ms | First-time load of ML models |
| Single Scan | <3000ms | On modern device |
| Storage Read | <100ms | From cache |
| Storage Write | <200ms | With validation |

### Running Benchmarks

```typescript
// Example performance test
monitor.startOperation('scan');
const result = await OMRService.scanSheetMusic(imagePath);
monitor.endOperation('scan');

const stats = monitor.getStats('scan');
console.log(`Scan took ${stats.avgDuration}ms`);
```

## Troubleshooting

### Test Timeouts
- Increase timeout for slow operations: `jest.setTimeout(10000)`
- Check for unresolved promises

### Mock Issues
- Verify mocks are defined before imports
- Check module name mapper in jest.config.js

### AsyncStorage Tests
- Clear data between tests to avoid conflicts
- Use try/catch for error scenarios

## Continuous Integration

### GitHub Actions Configuration

```yaml
- name: Run Tests
  run: npm test -- --coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Future Enhancements

1. **E2E Tests**: Add Detox for full app flow testing
2. **Performance Profiling**: Integrate with metro bundler
3. **Visual Regression**: Add screenshot comparison tests
4. **Mutation Testing**: Use Stryker to verify test quality
5. **Component Tests**: Add React Testing Library tests for UI components

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Guide](https://reactnative.dev/docs/testing-overview)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Contributing Tests

When adding new features:
1. Write tests before implementation (TDD)
2. Achieve minimum 70% coverage for new code
3. Follow existing test patterns
4. Update this guide if adding new test categories
5. Run full test suite before committing

---

**Last Updated**: 2024
**Maintainer**: Tsali Development Team
