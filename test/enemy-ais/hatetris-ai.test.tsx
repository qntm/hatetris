import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getLogic } from '../../src/components/Game/logic.ts'
import { hatetrisAi } from '../../src/enemy-ais/hatetris-ai.ts'
import { Tree } from '../../src/enemy-ais/tree.ts'
import hatetrisRotationSystem from '../../src/rotation-systems/hatetris-rotation-system.ts'

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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['S', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['Z', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['O', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['I', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['L', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['J', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['T', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['L', expectedState])
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

    const lookup = new Tree()
    lookup.set(well, [0])
    const expectedState = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates), ['S', expectedState])
  })

  // Loop avoidance
  it('generates a Z if it already generated an S once', async () => {
    const well0 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0001000110, // an S was landed here
      0b0011100011
    ]

    const well1 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0001000000,
      0b0011100000
    ]

    const lookup0 = new Tree()
    lookup0.set(well0, [0])
    const state0 = {
      numWellsSeen: 1,
      shared: {
        numWellsSeen: 1,
        lookup: lookup0
      }
    }

    const lookup1 = new Tree()
    lookup1.set(well0, [0])
    lookup1.set(well1, [1])
    const state1 = {
      numWellsSeen: 2,
      shared: {
        numWellsSeen: 2,
        lookup: lookup1
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well: well1
    }, state0, getNextCoreStates), ['Z', state1])
  })

  it('gives up and generates an S if EVERY piece leads into a cycle', async () => {
    const well0 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000001111 // an I was landed
    ]

    const well1 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000011,
      0b0000000011 // an O was landed
    ]

    const well2 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000111 // a J was landed
    ]

    const well3 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000001,
      0b0000000011 // an L was landed
    ]

    const well4 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000011,
      0b0000000010 // an S was landed
    ]

    const well5 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000011,
      0b0000000110 // a Z was landed
    ]
  
    const well6 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000010,
      0b0000000111 // a T was landed
    ]

    const well7 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ]

    const lookup6 = new Tree()
    lookup6.set(well0, [0])
    lookup6.set(well1, [1])
    lookup6.set(well2, [2])
    lookup6.set(well3, [3])
    lookup6.set(well4, [4])
    lookup6.set(well5, [5])
    lookup6.set(well6, [6])
    const state6 = {
      numWellsSeen: 7,
      shared: {
        numWellsSeen: 7,
        lookup: lookup6
      }
    }

    const lookup7 = new Tree()
    lookup7.set(well0, [0])
    lookup7.set(well1, [1])
    lookup7.set(well2, [2])
    lookup7.set(well3, [3])
    lookup7.set(well4, [4])
    lookup7.set(well5, [5])
    lookup7.set(well6, [6])
    lookup7.set(well7, [7])
    const state7 = {
      numWellsSeen: 8,
      shared: {
        numWellsSeen: 8,
        lookup: lookup7
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well: well7
    }, state6, getNextCoreStates), ['S', state7])
  })

  it('spawns the piece which leads into the fewest cycles', async () => {
    const well0 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000001111 // an I was landed
    ]

    const well1 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000011,
      0b0000000011 // an O was landed
    ]

    const well2 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000111 // a J was landed
    ]

    const well3 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000001,
      0b0000000011 // an L was landed
    ]

    const well4 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000011,
      0b0000000010 // an S was landed
    ]

    const well5 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000011,
      0b0000000110 // a Z was landed
    ]

    const well6 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000001100,
      0b0000011000 // a Z was landed (different)
    ]

    const well7 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000010,
      0b0000000111 // a T was landed
    ]

    const well8 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ]

    const lookup36 = new Tree()
    lookup36.set(well0, [0, 1, 2, 3, 4])
    lookup36.set(well1, [5, 6, 7, 8, 9])
    lookup36.set(well2, [10, 11, 12, 13, 14])
    lookup36.set(well3, [15, 16, 17, 18, 19])
    lookup36.set(well4, [20, 21, 22, 23, 24])
    lookup36.set(well5, [25, 26, 27])
    lookup36.set(well6, [28, 29, 30, 31, 32]) // `maxLoops` for Z will be 5, not 3
    lookup36.set(well7, [33, 34, 35])
    lookup36.set(well8, [36])
    const state36 = {
      numWellsSeen: 37,
      shared: {
        numWellsSeen: 37,
        lookup: lookup36
      }
    }

    const lookup37 = new Tree()
    lookup37.set(well0, [0, 1, 2, 3, 4])
    lookup37.set(well1, [5, 6, 7, 8, 9])
    lookup37.set(well2, [10, 11, 12, 13, 14])
    lookup37.set(well3, [15, 16, 17, 18, 19])
    lookup37.set(well4, [20, 21, 22, 23, 24])
    lookup37.set(well5, [25, 26, 27])
    lookup37.set(well6, [28, 29, 30, 31, 32]) // `maxLoops` for Z will be 5, not 3
    lookup37.set(well7, [33, 34, 35])
    lookup37.set(well8, [36, 37])
    const state37 = {
      numWellsSeen: 38,
      shared: {
        numWellsSeen: 38,
        lookup: lookup37
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well: well8 // already seen this well once!
    }, state36, getNextCoreStates), ['T', state37])
  })

  it('undo and redo', async () => {
    const well0 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000001111 // an I was landed
    ]

    const well1 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000011,
      0b0000000011 // an O was landed
    ]

    const well2 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000111 // a J was landed
    ]

    const well3 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000001,
      0b0000000011 // an L was landed
    ]

    const well4 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000001,
      0b0000000011,
      0b0000000010 // an S was landed
    ]

    const well5 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000011,
      0b0000000110 // a Z was landed
    ]

    const well6 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000001100,
      0b0000011000 // a Z was landed (different)
    ]

    const well7 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000010,
      0b0000000111 // a T was landed
    ]

    const well8 = [
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ]

    // This state indicates that we undid a long way
    const lookup36 = new Tree()
    lookup36.set(well0, [0, 1, 2, 3, 4])
    lookup36.set(well1, [5, 6, 7, 8, 9])
    lookup36.set(well2, [10, 11, 12, 13, 14])
    lookup36.set(well3, [15, 16, 17, 18, 19])
    lookup36.set(well4, [20, 21, 22, 23, 24])
    lookup36.set(well5, [25, 26, 27])
    lookup36.set(well6, [28, 29, 30, 31, 32]) // `maxLoops` for Z will be 5, not 3
    lookup36.set(well7, [33, 34, 35])
    lookup36.set(well8, [36])
    const state24 = {
      numWellsSeen: 25,
      shared: {
        numWellsSeen: 37,
        lookup: lookup36
      }
    }

    const lookup25 = new Tree()
    lookup25.set(well0, [0, 1, 2, 3, 4])
    lookup25.set(well1, [5, 6, 7, 8, 9])
    lookup25.set(well2, [10, 11, 12, 13, 14])
    lookup25.set(well3, [15, 16, 17, 18, 19])
    lookup25.set(well4, [20, 21, 22, 23, 24])
    lookup25.set(well5, [])
    lookup25.set(well6, []) // `maxLoops` for Z will be 5, not 3
    lookup25.set(well7, [])
    lookup25.set(well8, [25])
    const state25 = {
      numWellsSeen: 26,
      shared: {
        numWellsSeen: 26,
        lookup: lookup25
      }
    }

    assert.deepEqual(await hatetrisAi({
      score: 0,
      well: well8
    }, state24, getNextCoreStates), ['Z', state25])
  })
})
