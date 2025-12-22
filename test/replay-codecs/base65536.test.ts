import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import * as base65536 from '../../src/replay-codecs/base65536.js'

describe('base65536', () => {
  it('works', () => {
    assert.equal(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D']), '𤺤')
    assert.deepEqual(base65536.decode('𤺤'), ['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    assert.equal(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U']), '𤺤ᗐ')
    assert.equal(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L']), '𤺤ᗐ')
    assert.deepEqual(base65536.decode('𤺤ᗐ'),
      ['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
