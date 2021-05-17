/* eslint-env jest */

'use strict'

import { shallow } from 'enzyme'
import * as React from 'react'

import Game from '../components/Game/Game'
import { HatetrisAi, LovetrisAi } from './hatetris-ai'
import hatetrisRotationSystem from '../rotation-systems/hatetris-rotation-system'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

describe('HatetrisAi', () => {
  const game = shallow<Game>(
    <Game
      bar={4}
      EnemyAi={HatetrisAi}
      replayTimeout={0}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={8}
      wellWidth={10}
    />
  )

  const hatetris = game.state().enemyAi

  it('generates an S by default', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000
    ])).toBe('S')
  })

  it('generates a Z when an S would result in a lower stack', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0001000000,
      0b1111011111
    ])).toBe('Z')
  })

  it('generates an O when an S or Z would result in a lower stack', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111101111
    ])).toBe('O')
  })

  it('generates an I when an S, Z or O would result in a lower stack', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111001111
    ])).toBe('I')
  })

  it('generates an L when an S, Z, O or I would result in a lower stack', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111100111,
      0b1011100111,
      0b1111110111
    ])).toBe('L')
  })

  it('generates a J when an S, Z, O, I or L would result in a lower stack', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111100111,
      0b1011100111,
      0b1111101111
    ])).toBe('J')
  })

  it('generates a T when an S, Z, O, I, L or J would result in a lower stack', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1000000000,
      0b1111000011,
      0b1111100111
    ])).toBe('T')
  })

  // Only while writing these unit tests did I discover this subtle piece of
  // behaviour. The HATETRIS AI doesn't track *lines made*, it tracks *stack
  // height*. In this situation, L, J and T would all result in a stack
  // reaching y = 6. L comes first so it is selected. This happens even though
  // L and J *give you a line* while T would not.
  it('just gives you a line sometimes!', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111000011,
      0b1111100111
    ])).toBe('L')
  })

  // Coverage...
  it('generates an S when say an I would clear the board', () => {
    expect(hatetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1111111110,
      0b1111111110,
      0b1111111110,
      0b1111111110
    ])).toBe('S')
  })

  it('throws an exception on an unrecognised piece', () => {
    expect(() => shallow<Game>(
      <Game
        bar={4}
        EnemyAi={HatetrisAi}
        replayTimeout={0}
        rotationSystem={{
          rotations: {
            DOT: [
              { xMin: 0, yMin: 0, xDim: 1, yDim: 1, rows: [1] },
              { xMin: 0, yMin: 0, xDim: 1, yDim: 1, rows: [1] },
              { xMin: 0, yMin: 0, xDim: 1, yDim: 1, rows: [1] },
              { xMin: 0, yMin: 0, xDim: 1, yDim: 1, rows: [1] }
            ]
          },
          placeNewPiece: hatetrisRotationSystem.placeNewPiece
        }}
        wellDepth={8}
        wellWidth={10}
      />
    ))
      .toThrowError('Unrecognised piece')
  })
})

describe('LovetrisAi', () => {
  const game = shallow<Game>(
    <Game
      bar={4}
      EnemyAi={LovetrisAi}
      replayTimeout={0}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={8}
      wellWidth={10}
    />
  )

  const lovetris = game.state().enemyAi

  it('generates a T by default', () => {
    expect(lovetris([
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b0000000000,
      0b1000000000,
      0b1000000000,
      0b1000000000,
      0b1000000000
    ])).toBe('T')
  })
})
