/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/unit/**/*.test.ts', '**/integration/**/*.test.ts'],

  // Résout les modules depuis tests/node_modules en priorité,
  // même pour les fichiers importés depuis ../../backend/src/
  modulePaths: ['<rootDir>/node_modules'],

  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/setup/prisma-client-mock.ts',
  },

  setupFiles: ['<rootDir>/setup/env.ts'],
  clearMocks: true,
};
