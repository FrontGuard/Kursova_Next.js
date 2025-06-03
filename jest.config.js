const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node', 'mjs'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: { runtime: 'automatic' },
        },
      },
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(next|next-auth|@next-auth)/)',
  ],
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 15000,

  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  testMatch: [
  '<rootDir>/src/__test__/admin.test.tsx',
  /*'<rootDir>/src/__test__/auth.test.tsx',*/
  '<rootDir>/src/__test__/channel.test.tsx',
  '<rootDir>/src/__test__/CommentsSection.test.tsx',
  '<rootDir>/src/__test__/Footer.test.tsx',
  '<rootDir>/src/__test__/global-error.test.tsx',
  '<rootDir>/src/__test__/Header.test.tsx',
  '<rootDir>/src/__test__/layout.test.tsx',
  '<rootDir>/src/__test__/LikeButton.test.tsx',
  '<rootDir>/src/__test__/login.test.tsx',
  '<rootDir>/src/__test__/page.test.tsx',
  '<rootDir>/src/__test__/profile.test.tsx',
  '<rootDir>/src/__test__/Providers.test.tsx',
  '<rootDir>/src/__test__/RecordViewClient.test.tsx',
  '<rootDir>/src/__test__/register.test.tsx',
  '<rootDir>/src/__test__/upload.test.tsx',
  '<rootDir>/src/__test__/video.test.tsx',
  '<rootDir>/src/__test__/videoid.test.tsx',
],
};

module.exports = createJestConfig(customJestConfig);