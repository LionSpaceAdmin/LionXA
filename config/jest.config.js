/** @type {import('jest').Config} */
const config = {
  rootDir: '..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  // Store Jest cache inside the repo to avoid /tmp pressure
  cacheDirectory: '<rootDir>/.jestcache',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  modulePathIgnorePatterns: ['<rootDir>/src/profiles/agent_'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/profiles/agent_*/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/e2e'
  ],
};

module.exports = config;
