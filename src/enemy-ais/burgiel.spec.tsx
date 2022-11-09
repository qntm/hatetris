/* eslint-env jest */

'use strict'

import type { CoreState } from '../components/Game/Game'
import { burgAi } from './burgiel'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

describe('burgAi', () => {
  const getNextCoreStates = (): CoreState[] => []

  it('generates an S at first', async () => {
    expect(await burgAi({
      score: 0,
      well: [
        0b000000,
        0b000000,
        0b000000,
        0b000000,
        0b000000,
        0b000000
      ]
    }, undefined, getNextCoreStates)).toEqual(['S', 'Z'])
  })

  it('generates a Z next', async () => {
    expect(await burgAi({
      score: 0,
      well: [
        0b000000,
        0b000000,
        0b000000,
        0b000001,
        0b000011,
        0b000010
      ]
    }, 'Z', getNextCoreStates)).toEqual(['Z', 'S'])
  })

  it('generates an S after that', async () => {
    expect(await burgAi({
      score: 0,
      well: [
        0b000000,
        0b000000,
        0b000000,
        0b001001,
        0b001111,
        0b000110
      ]
    }, 'S', getNextCoreStates)).toEqual(['S', 'Z'])
  })
})
