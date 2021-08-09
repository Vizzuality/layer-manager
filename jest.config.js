// jest.config.js
module.exports = {
  rootDir: 'src',
  moduleFileExtensions: ['js', 'jsx'],
  moduleDirectories: ['node_modules'],
  collectCoverage: process.env.JEST_CI && JSON.parse(process.env.JEST_CI),
  collectCoverageFrom: ['**/*.js']
};
