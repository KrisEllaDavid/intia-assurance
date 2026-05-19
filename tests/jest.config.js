/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/unit/**/*.test.ts', '**/integration/**/*.test.ts'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/setup/prisma-client-mock.ts',
  },
  setupFiles: ['<rootDir>/setup/env.ts'],
  clearMocks: true,
};
