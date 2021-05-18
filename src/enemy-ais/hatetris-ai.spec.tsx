/* eslint-env jest */

'use strict'

import { shallow } from 'enzyme'
import * as React from 'react'

import Game from '../components/Game/Game'
import { hatetrisAi, lovetrisAi } from './hatetris-ai'
import hatetrisRotationSystem from '../rotation-systems/hatetris-rotation-system'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

describe('hatetrisAi', () => {
  const game = shallow<Game>(
    <Game
      bar={4}
      enemyAi={hatetrisAi}
      replayTimeout={0}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={8}
      wellWidth={10}
    />
  )

  const getPossibleFutures = game.instance().getPossibleFutures

  it('generates an S by default', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ], getPossibleFutures)).toBe('S')
  })

  it('generates a Z when an S would result in a lower stack', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0001000000,
      0b1111011111
    ], getPossibleFutures)).toBe('Z')
  })

  it('generates an O when an S or Z would result in a lower stack', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111101111
    ], getPossibleFutures)).toBe('O')
  })

  it('generates an I when an S, Z or O would result in a lower stack', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111001111
    ], getPossibleFutures)).toBe('I')
  })

  it('generates an L when an S, Z, O or I would result in a lower stack', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111100111,
      0b1011100111,
      0b1111110111
    ], getPossibleFutures)).toBe('L')
  })

  it('generates a J when an S, Z, O, I or L would result in a lower stack', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111100111,
      0b1011100111,
      0b1111101111
    ], getPossibleFutures)).toBe('J')
  })

  it('generates a T when an S, Z, O, I, L or J would result in a lower stack', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1000000000,
      0b1111000011,
      0b1111100111
    ], getPossibleFutures)).toBe('T')
  })

  // Only while writing these unit tests did I discover this subtle piece of
  // behaviour. The HATETRIS AI doesn't track *lines made*, it tracks *stack
  // height*. In this situation, L, J and T would all result in a stack
  // reaching y = 6. L comes first so it is selected. This happens even though
  // L and J *give you a line* while T would not.
  it('just gives you a line sometimes!', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111000011,
      0b1111100111
    ], getPossibleFutures)).toBe('L')
  })

  // Coverage...
  it('generates an S when say an I would clear the board', () => {
    expect(hatetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111111110,
      0b1111111110,
      0b1111111110,
      0b1111111110
    ], getPossibleFutures)).toBe('S')
  })
})

describe('lovetrisAi', () => {
  const game = shallow<Game>(
    <Game
      bar={4}
      enemyAi={lovetrisAi}
      replayTimeout={0}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={8}
      wellWidth={10}
    />
  )

  const getPossibleFutures = game.instance().getPossibleFutures

  it('generates a T by default', () => {
    expect(lovetrisAi([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1000000000,
      0b1000000000,
      0b1000000000,
      0b1000000000
    ], getPossibleFutures)).toBe('T')
  })
})
