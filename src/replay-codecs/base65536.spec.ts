/* eslint-env jest */

import assert from 'node:assert'
import * as base65536 from './base65536'

describe('base65536', () => {
  it('works', () => {
    assert.strictEqual(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D']), '𤺤')
    assert.deepStrictEqual(base65536.decode('𤺤'), ['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    assert.strictEqual(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U']), '𤺤ᗐ')
    assert.strictEqual(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L']), '𤺤ᗐ')
    assert.deepStrictEqual(base65536.decode('𤺤ᗐ'),
      ['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
