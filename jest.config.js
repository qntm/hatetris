module.exports = {
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/config/jestSetup.js'],
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js'
  }
}
