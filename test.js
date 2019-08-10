'use strict'

import Jasmine from 'jasmine'

const jasmine = new Jasmine()
jasmine.loadConfig({
  spec_dir: 'test',
  spec_files: [
    '**/*.spec.js'
  ],
  stopSpecOnExpectationFailure: false,
  random: true
})

jasmine.execute()
