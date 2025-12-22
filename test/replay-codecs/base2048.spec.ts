import assert from 'node:assert/strict'

import { describe, it } from 'mocha'
import * as base2048 from '../../src/replay-codecs/base2048.js'

describe('base2048', () => {
  it('works', () => {
    assert.equal(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D']), 'ਹԇ')
    assert.deepEqual(base2048.decode('ਹԇ'), ['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    assert.equal(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U']), 'ਹӼ1')
    assert.equal(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L']), 'ਹӼ1')
    assert.deepEqual(base2048.decode('ਹӼ1'),
      ['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
