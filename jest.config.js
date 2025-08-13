// Jest Configuration untuk JA-CMS
// Centralized testing configuration

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Project structure
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/tests/backend/**/*.test.ts', '<rootDir>/tests/backend/**/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/backend/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/backend/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
      collectCoverageFrom: [
        'backend/**/*.ts',
        '!backend/**/*.d.ts',
        '!backend/app.ts',
      ],
      coverageDirectory: 'coverage/backend',
      coverageReporters: ['text', 'lcov', 'html'],
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/frontend/**/*.test.ts', '<rootDir>/tests/frontend/**/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/frontend/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/frontend/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
      collectCoverageFrom: [
        'frontend/**/*.ts',
        'frontend/**/*.tsx',
        '!frontend/**/*.d.ts',
        '!frontend/**/*.stories.tsx',
      ],
      coverageDirectory: 'coverage/frontend',
      coverageReporters: ['text', 'lcov', 'html'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts', '<rootDir>/tests/integration/**/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
      collectCoverageFrom: [
        'backend/**/*.ts',
        'frontend/src/**/*.ts',
        'frontend/src/**/*.tsx',
      ],
      coverageDirectory: 'coverage/integration',
      coverageReporters: ['text', 'lcov', 'html'],
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.ts', '<rootDir>/tests/e2e/**/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
      },
      collectCoverageFrom: [
        'backend/**/*.ts',
        'frontend/src/**/*.ts',
        'frontend/src/**/*.tsx',
      ],
      coverageDirectory: 'coverage/e2e',
      coverageReporters: ['text', 'lcov', 'html'],
    },
  ],

  // Global configuration
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
}; 