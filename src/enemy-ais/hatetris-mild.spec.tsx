/* eslint-env jest */

import { getLogic } from '../components/Game/logic'
import { hatetrisMildAi } from './hatetris-mild'
import hatetrisRotationSystem from '../rotation-systems/hatetris-rotation-system'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

const logic = getLogic({
  bar: 4,
  replayTimeout: 0,
  rotationSystem: hatetrisRotationSystem,
  wellDepth: 8,
  wellWidth: 10
})

const getNextCoreStates = logic.getNextCoreStates

describe('hatetrisMildAi', () => {
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('S')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('Z')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('O')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('I')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('L')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('J')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('T')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('L')
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual('S')
  })

  // Loop avoidance is NOT PRESENT
  it('generates an S even if it already generated an S once', async () => {
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
    expect(await hatetrisMildAi({
      score: 0,
      well
    }, new Set([
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000110, // an S was landed here
        0b0011100011
      ])
    ]), getNextCoreStates)).toEqual('S')
  })
})
