module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-vizzuality`
  extends: ["vizzuality"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
