/* eslint-env jest */

import * as assert from 'node:assert'
import hex from '../../src/replay-codecs/hex.ts'

describe('hex', () => {
  it('works', () => {
    assert.strictEqual(hex.encode([
      'L', 'L', 'L', 'R', 'L', 'D', 'L', 'U', 'R', 'L', 'R', 'R', 'R', 'D',
      'R', 'U', 'D', 'L', 'D', 'R', 'D', 'D', 'D', 'U', 'U', 'L', 'U', 'R',
      'U', 'D', 'U', 'U'
    ]), '0123 4567 89AB CDEF ')
    assert.deepStrictEqual(hex.decode('0123 4567 89AB CDEF '), [
      'L', 'L', 'L', 'R', 'L', 'D', 'L', 'U', 'R', 'L', 'R', 'R', 'R', 'D',
      'R', 'U', 'D', 'L', 'D', 'R', 'D', 'D', 'D', 'U', 'U', 'L', 'U', 'R',
      'U', 'D', 'U', 'U'
    ])
  })

  it('adds an extra D to shore up the count if need be', () => {
    assert.strictEqual(hex.encode(['L']), hex.encode(['L', 'D']))
    assert.strictEqual(hex.encode(['R']), hex.encode(['R', 'D']))
    assert.strictEqual(hex.encode(['D']), hex.encode(['D', 'D']))
    assert.strictEqual(hex.encode(['U']), hex.encode(['U', 'D']))
  })
})
