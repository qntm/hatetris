/* eslint-env jest */

import assert from 'node:assert'
import * as base2048 from './base2048'

describe('base2048', () => {
  it('works', () => {
    assert.strictEqual(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D']), 'ਹԇ')
    assert.deepStrictEqual(base2048.decode('ਹԇ'), ['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    assert.strictEqual(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U']), 'ਹӼ1')
    assert.strictEqual(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L']), 'ਹӼ1')
    assert.deepStrictEqual(base2048.decode('ਹӼ1'),
      ['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
