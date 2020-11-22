module.exports = {
  "testEnvironment": "node",
  "coveragePathIgnorePatterns": [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
  ],
  "reporters": ["default", "jest-stare"],
  "testResultsProcessor": "./node_modules/jest-stare"
}