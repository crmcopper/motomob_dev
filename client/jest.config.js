/**
 * @file Jest configuration.
 */
const { defaults } = require("jest-config")

module.exports = {
  rootDir: "__test__",
  testRegex: ".*test\\.js$",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFiles: ["<rootDir>/setup.js"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "js"],
}

//jest.setTimeout(30000)
