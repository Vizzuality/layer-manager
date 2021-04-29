// jest.config.js
module.exports = {
  collectCoverage: process.env.JEST_CI && JSON.parse(process.env.JEST_CI),
  collectCoverageFrom: ['**/*.test.js', '**/**.test.ts'],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'jsx', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
