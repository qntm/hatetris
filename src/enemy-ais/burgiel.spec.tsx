/* eslint-env jest */

import assert from 'node:assert'
import type { CoreState } from '../components/Game/Game'
import { burgAi } from './burgiel'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

describe('burgAi', () => {
  const getNextCoreStates = (): CoreState[] => []

  it('generates an S at first', async () => {
    assert.deepStrictEqual(await burgAi({
      score: 0,
      well: [
        0b000000,
        0b000000,
        0b000000,
        0b000000,
        0b000000,
        0b000000
      ]
    }, undefined, getNextCoreStates), ['S', 'Z'])
  })

  it('generates a Z next', async () => {
    assert.deepStrictEqual(await burgAi({
      score: 0,
      well: [
        0b000000,
        0b000000,
        0b000000,
        0b000001,
        0b000011,
        0b000010
      ]
    }, 'Z', getNextCoreStates), ['Z', 'S'])
  })

  it('generates an S after that', async () => {
    assert.deepStrictEqual(await burgAi({
      score: 0,
      well: [
        0b000000,
        0b000000,
        0b000000,
        0b001001,
        0b001111,
        0b000110
      ]
    }, 'S', getNextCoreStates), ['S', 'Z'])
  })
})
