// Jest setup file for React Native Testing Library

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
});