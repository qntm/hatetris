import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getLogic } from '../../src/components/Game/logic.js'
import { hatetrisAi } from '../../src/enemy-ais/hatetris-ai.js'
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

describe('hatetrisAi', () => {
  it('generates an S by default', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['S', {
      [JSON.stringify(well)]: 1
    }])
  })

  it('generates a Z when an S would result in a lower stack', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0001000000,
      0b1111011111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['Z', {
      [JSON.stringify(well)]: 1
    }])
  })

  it('generates an O when an S or Z would result in a lower stack', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111101111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['O', {
      [JSON.stringify(well)]: 1
    }])
  })

  it('generates an I when an S, Z or O would result in a lower stack', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111001111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['I', {
      [JSON.stringify(well)]: 1
    }])
  })

  it('generates an L when an S, Z, O or I would result in a lower stack', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111100111,
      0b1011100111,
      0b1111110111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['L', {
      [JSON.stringify(well)]: 1
    }])
  })

  it('generates a J when an S, Z, O, I or L would result in a lower stack', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111100111,
      0b1011100111,
      0b1111101111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['J', {
      [JSON.stringify(well)]: 1
    }])
  })

  it('generates a T when an S, Z, O, I, L or J would result in a lower stack', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1000000000,
      0b1111000011,
      0b1111100111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['T', {
      [JSON.stringify(well)]: 1
    }])
  })

  // Only while writing these unit tests did I discover this subtle piece of
  // behaviour. The HATETRIS AI doesn't track *lines made*, it tracks *stack
  // height*. In this situation, L, J and T would all result in a stack
  // reaching y = 6. L comes first so it is selected. This happens even though
  // L and J *give you a line* while T would not.
  it('just gives you a line sometimes!', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111000011,
      0b1111100111
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['L', {
      [JSON.stringify(well)]: 1
    }])
  })

  // Coverage...
  it('generates an S when say an I would clear the board', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111111110,
      0b1111111110,
      0b1111111110,
      0b1111111110
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['S', {
      [JSON.stringify(well)]: 1
    }])
  })

  // Loop avoidance
  it('generates a Z if it already generated an S once', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0001000000,
      0b0011100000
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, {
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000110, // an S was landed here
        0b0011100011
      ])]: 1
    }, getNextCoreStates), ['Z', {
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000110,
        0b0011100011
      ])]: 1,
      [JSON.stringify(well)]: 1
    }])
  })

  it('gives up and generates an S if EVERY piece leads into a cycle', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, {
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001111 // an I was landed
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000011 // an O was landed
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000111 // a J was landed
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000001,
        0b0000000011 // an L was landed
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000011,
        0b0000000010 // an S was landed
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000110 // a Z was landed
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000010,
        0b0000000111 // a T was landed
      ])]: 1
    }, getNextCoreStates), ['S', {
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001111
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000011
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000111
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000001,
        0b0000000011
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000011,
        0b0000000010
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000110
      ])]: 1,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000010,
        0b0000000111
      ])]: 1,
      [JSON.stringify(well)]: 1
    }])
  })

  it('spawns the piece which leads into the fewest cycles', async () => {
    const well = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ]
    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, {
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001111 // an I was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000011 // an O was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000111 // a J was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000001,
        0b0000000011 // an L was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000011,
        0b0000000010 // an S was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000110 // a Z was landed
      ])]: 3,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001100,
        0b0000011000 // a Z was landed (different)
      ])]: 5, // `maxLoops` for Z will be 5, not 3
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000010,
        0b0000000111 // a T was landed
      ])]: 3,
      [JSON.stringify(well)]: 1 // already seen this well once!
    }, getNextCoreStates), ['T', {
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001111 // an I was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000011 // an O was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000111 // a J was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000001,
        0b0000000011 // an L was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000011,
        0b0000000010 // an S was landed
      ])]: 5,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000110 // a Z was landed
      ])]: 3,
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001100,
        0b0000011000 // a Z was landed (different)
      ])]: 5, // `maxLoops` for Z will be 5, not 3
      [JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000010,
        0b0000000111 // a T was landed
      ])]: 3,
      [JSON.stringify(well)]: 2
    }])
  })
})
