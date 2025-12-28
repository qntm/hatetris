import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import hex from '../../src/replay-codecs/hex.ts'

describe('hex', () => {
  it('works', () => {
    assert.equal(hex.encode([
      'L', 'L', 'L', 'R', 'L', 'D', 'L', 'U', 'R', 'L', 'R', 'R', 'R', 'D',
      'R', 'U', 'D', 'L', 'D', 'R', 'D', 'D', 'D', 'U', 'U', 'L', 'U', 'R',
      'U', 'D', 'U', 'U'
    ]), '0123 4567 89AB CDEF ')
    assert.deepEqual(hex.decode('0123 4567 89AB CDEF '), [
      'L', 'L', 'L', 'R', 'L', 'D', 'L', 'U', 'R', 'L', 'R', 'R', 'R', 'D',
      'R', 'U', 'D', 'L', 'D', 'R', 'D', 'D', 'D', 'U', 'U', 'L', 'U', 'R',
      'U', 'D', 'U', 'U'
    ])
  })

  it('adds an extra D to shore up the count if need be', () => {
    assert.equal(hex.encode(['L']), hex.encode(['L', 'D']))
    assert.equal(hex.encode(['R']), hex.encode(['R', 'D']))
    assert.equal(hex.encode(['D']), hex.encode(['D', 'D']))
    assert.equal(hex.encode(['U']), hex.encode(['U', 'D']))
  })
})
