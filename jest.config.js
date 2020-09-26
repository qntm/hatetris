module.exports = {
  collectCoverage: true,
  setupFilesAfterEnv: ['<rootDir>/config/jestSetup.js'],
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ]
}
