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
    expect(hatetrisAi({
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
    }, undefined, getNextCoreStates)).toEqual(['S', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ],
      pieceIds: ['S']
    }]])
  })

  it('generates a Z when an S would result in a lower stack', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000000,
        0b1111011111
      ]
    }, undefined, getNextCoreStates)).toEqual(['Z', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000000,
        0b1111011111
      ],
      pieceIds: ['Z']
    }]])
  })

  it('generates an O when an S or Z would result in a lower stack', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111101111
      ]
    }, undefined, getNextCoreStates)).toEqual(['O', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111101111
      ],
      pieceIds: ['O']
    }]])
  })

  it('generates an I when an S, Z or O would result in a lower stack', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111001111
      ]
    }, undefined, getNextCoreStates)).toEqual(['I', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111001111
      ],
      pieceIds: ['I']
    }]])
  })

  it('generates an L when an S, Z, O or I would result in a lower stack', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111100111,
        0b1011100111,
        0b1111110111
      ]
    }, undefined, getNextCoreStates)).toEqual(['L', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111100111,
        0b1011100111,
        0b1111110111
      ],
      pieceIds: ['L']
    }]])
  })

  it('generates a J when an S, Z, O, I or L would result in a lower stack', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111100111,
        0b1011100111,
        0b1111101111
      ]
    }, undefined, getNextCoreStates)).toEqual(['J', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111100111,
        0b1011100111,
        0b1111101111
      ],
      pieceIds: ['J']
    }]])
  })

  it('generates a T when an S, Z, O, I, L or J would result in a lower stack', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1000000000,
        0b1111000011,
        0b1111100111
      ]
    }, undefined, getNextCoreStates)).toEqual(['T', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1000000000,
        0b1111000011,
        0b1111100111
      ],
      pieceIds: ['T']
    }]])
  })

  // Only while writing these unit tests did I discover this subtle piece of
  // behaviour. The HATETRIS AI doesn't track *lines made*, it tracks *stack
  // height*. In this situation, L, J and T would all result in a stack
  // reaching y = 6. L comes first so it is selected. This happens even though
  // L and J *give you a line* while T would not.
  it('just gives you a line sometimes!', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111000011,
        0b1111100111
      ]
    }, undefined, getNextCoreStates)).toEqual(['L', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111000011,
        0b1111100111
      ],
      pieceIds: ['L']
    }]])
  })

  // Coverage...
  it('generates an S when say an I would clear the board', () => {
    expect(hatetrisAi({
      score: 0,
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111111110,
        0b1111111110,
        0b1111111110,
        0b1111111110
      ]
    }, undefined, getNextCoreStates)).toEqual(['S', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111111110,
        0b1111111110,
        0b1111111110,
        0b1111111110
      ],
      pieceIds: ['S']
    }]])
  })

  // Loop avoidance
  it('generates a Z if it already generated an S once', () => {
    expect(hatetrisAi({
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
    }, [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ],
      pieceIds: ['S']
    }], getNextCoreStates)).toEqual(['Z', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ],
      pieceIds: ['S', 'Z']
    }]])
  })

  it('gives up and generates an S if it already generated EVERY piece', () => {
    expect(hatetrisAi({
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
    }, [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ],
      pieceIds: ['S', 'Z', 'O', 'I', 'L', 'J', 'T']
    }], getNextCoreStates)).toEqual(['S', [{
      well: [
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ],
      pieceIds: ['S', 'Z', 'O', 'I', 'L', 'J', 'T'] // unchanged
    }]])
  })
})
