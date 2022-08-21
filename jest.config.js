module.exports = {
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/config/jestSetup.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(base2048|base65536)/)'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testEnvironment: 'jsdom'
}
