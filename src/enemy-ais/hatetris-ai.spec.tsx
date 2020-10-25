/* eslint-env jest */

'use strict'

import { shallow } from 'enzyme'
import * as React from 'react'

import Game from '../components/Game/Game.tsx'
import { Hatetris0, Hatetris1 } from './hatetris-ai.ts'
import hatetrisRotationSystem from '../rotation-systems/hatetris-rotation-system.ts'

// Note: well bits are flipped compared to what you would see on the screen.
// Least significant bit is rendered on the *left* on web, but appears to the
// *right* of each binary numeric literal

describe('HatetrisAi', () => {
  describe('Hatetris0', () => {
    const game = shallow<Game>(
      <Game
        bar={4}
        EnemyAi={Hatetris0}
        replayTimeout={0}
        rotationSystem={hatetrisRotationSystem}
        wellDepth={8}
        wellWidth={10}
      />
    )

    const hatetris0 = game.state().enemyAi

    it('generates an S by default', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000
      ])).toBe('0') // S
    })

    it('generates a Z when an S would result in a lower stack', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0001000000,
        0b1111011111
      ])).toBe('1') // Z
    })

    it('generates an O when an S or Z would result in a lower stack', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111101111
      ])).toBe('2') // O
    })

    it('generates an I when an S, Z or O would result in a lower stack', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111001111
      ])).toBe('3') // I
    })

    it('generates an L when an S, Z, O or I would result in a lower stack', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111100111,
        0b1011100111,
        0b1111110111
      ])).toBe('4') // L
    })

    it('generates a J when an S, Z, O, I or L would result in a lower stack', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111100111,
        0b1011100111,
        0b1111101111
      ])).toBe('5') // J
    })

    it('generates a T when an S, Z, O, I, L or J would result in a lower stack', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1000000000,
        0b1111000011,
        0b1111100111
      ])).toBe('6') // T
    })

    // Only while writing these unit tests did I discover this subtle piece of
    // behaviour. The HATETRIS AI doesn't track *lines made*, it tracks *stack
    // height*. In this situation, L, J and T would all result in a stack
    // reaching y = 6. L comes first so it is selected. This happens even though
    // L and J *give you a line* while T would not.
    it('just gives you a line sometimes!', () => {
      expect(hatetris0([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111000011,
        0b1111100111
      ])).toBe('4') // L
    })
  })

  describe('Hatetris1', () => {
    const game = shallow<Game>(
      <Game
        bar={4}
        EnemyAi={Hatetris1}
        replayTimeout={0}
        rotationSystem={hatetrisRotationSystem}
        wellDepth={8}
        wellWidth={10}
      />
    )

    const hatetris1 = game.state().enemyAi

    it('picks a different piece in some situations', () => {
      expect(hatetris1([
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b0000000000,
        0b1111000011,
        0b1111100111
      ])).toBe('6') // T (followed by O, resulting in stack reaching y = 4)
    })
  })
})
