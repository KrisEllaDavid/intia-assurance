/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/unit/**/*.test.ts', '**/integration/**/*.test.ts'],

  // Résout les modules depuis tests/node_modules même pour les fichiers
  // importés depuis ../../backend/src/ (backend/node_modules absent en CI)
  modulePaths: ['<rootDir>/node_modules'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      // Ignore TS2307 "Cannot find module" — les deps backend
      // sont résolues à l'exécution via modulePaths, pas par tsc
      diagnostics: { ignoreCodes: [2307] },
    }],
  },

  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/setup/prisma-client-mock.ts',
  },

  setupFiles: ['<rootDir>/setup/env.ts'],
  clearMocks: true,
};
