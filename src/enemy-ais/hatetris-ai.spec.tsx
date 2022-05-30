/* eslint-env jest */

'use strict'

import { shallow } from 'enzyme'
import * as React from 'react'

import Game from '../components/Game/Game'
import { hatetrisAi } from './hatetris-ai'
import hatetrisRotationSystem from '../rotation-systems/hatetris-rotation-system'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

const game = shallow<Game>(
  <Game
    bar={4}
    replayTimeout={0}
    rotationSystem={hatetrisRotationSystem}
    wellDepth={8}
    wellWidth={10}
  />
)

const getNextCoreStates = game.instance().getNextCoreStates

describe('hatetrisAi', () => {
  it('generates an S by default', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['S', new Set([
      JSON.stringify(well)
    ])])
  })

  it('generates a Z when an S would result in a lower stack', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['Z', new Set([
      JSON.stringify(well)
    ])])
  })

  it('generates an O when an S or Z would result in a lower stack', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['O', new Set([
      JSON.stringify(well)
    ])])
  })

  it('generates an I when an S, Z or O would result in a lower stack', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['I', new Set([
      JSON.stringify(well)
    ])])
  })

  it('generates an L when an S, Z, O or I would result in a lower stack', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['L', new Set([
      JSON.stringify(well)
    ])])
  })

  it('generates a J when an S, Z, O, I or L would result in a lower stack', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['J', new Set([
      JSON.stringify(well)
    ])])
  })

  it('generates a T when an S, Z, O, I, L or J would result in a lower stack', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['T', new Set([
      JSON.stringify(well)
    ])])
  })

  // Only while writing these unit tests did I discover this subtle piece of
  // behaviour. The HATETRIS AI doesn't track *lines made*, it tracks *stack
  // height*. In this situation, L, J and T would all result in a stack
  // reaching y = 6. L comes first so it is selected. This happens even though
  // L and J *give you a line* while T would not.
  it('just gives you a line sometimes!', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['L', new Set([
      JSON.stringify(well)
    ])])
  })

  // Coverage...
  it('generates an S when say an I would clear the board', () => {
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
    expect(hatetrisAi({
      score: 0,
      well
    }, undefined, getNextCoreStates)).toEqual(['S', new Set([
      JSON.stringify(well)
    ])])
  })

  // Loop avoidance
  it('generates a Z if it already generated an S once', () => {
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
    expect(hatetrisAi({
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
    ]), getNextCoreStates)).toEqual(['Z', new Set([
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000110,
        0b0011100011
      ]),
      JSON.stringify(well)
    ])])
  })

  it('gives up and generates an S if EVERY piece leads into a cycle', () => {
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
    expect(hatetrisAi({
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
        0b0000000000,
        0b0000001111 // an I was landed
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000011 // an O was landed
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000111 // a J was landed
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000001,
        0b0000000011 // an L was landed
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000011,
        0b0000000010 // an S was landed
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000110 // a Z was landed
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000010,
        0b0000000111 // a T was landed
      ])
    ]), getNextCoreStates)).toEqual(['S', new Set([
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000001111
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000011
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000111
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000001,
        0b0000000011
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000001,
        0b0000000011,
        0b0000000010
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000011,
        0b0000000110
      ]),
      JSON.stringify([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000010,
        0b0000000111
      ]),
      JSON.stringify(well)
    ])])
  })
})
