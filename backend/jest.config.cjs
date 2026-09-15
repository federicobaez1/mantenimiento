module.exports = {
  testEnvironment: 'node',
  runInBand: true,
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFiles: ['<rootDir>/tests/setupEnv.cjs'],
  globalSetup: '<rootDir>/tests/globalSetup.cjs',
  testTimeout: 20000,
}