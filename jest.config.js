// jest.config.js
module.exports = {
  rootDir: 'test',
  moduleFileExtensions: ['js', 'jsx'],
  moduleDirectories: ['node_modules'],
  collectCoverage: process.env.JEST_CI && JSON.parse(process.env.JEST_CI),
  collectCoverageFrom: ['**/*.js']
};
