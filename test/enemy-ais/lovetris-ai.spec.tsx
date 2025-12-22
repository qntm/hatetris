import * as assert from 'node:assert/strict'
import { describe, it } from 'mocha'
import { getLogic } from '../../src/components/Game/logic.js'
import { lovetrisAi } from '../../src/enemy-ais/lovetris-ai.js'
import hatetrisRotationSystem from '../../src/rotation-systems/hatetris-rotation-system.js'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

const logic = getLogic({
  bar: 4,
  replayTimeout: 0,
  copyTimeout: 0,
  rotationSystem: hatetrisRotationSystem,
  wellDepth: 8,
  wellWidth: 10
})

const getNextCoreStates = logic.getNextCoreStates

describe('lovetrisAi', () => {
  it('generates I every time right now', async () => {
    assert.equal(await lovetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ]
    }, undefined, getNextCoreStates), 'I')
  })
})
