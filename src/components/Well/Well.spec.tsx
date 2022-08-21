/* eslint-env jest */

'use strict'

import { mount } from 'enzyme'
import * as React from 'react'

import { Well } from './Well'
import type { WellProps } from './Well'
import hatetrisRotationSystem from '../../rotation-systems/hatetris-rotation-system'

const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4

describe('<Well>', () => {
  const getWell = (props: Partial<WellProps> = {}) => mount(
    <Well
      bar={bar}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={wellDepth}
      wellWidth={wellWidth}
      wellState={null}
      {...props}
    />
  )

  it('null well state', () => {
    const well = getWell()
    expect(well.find('.well__cell')).toHaveLength(200)
  })

  it('initial well state', () => {
    const well = getWell({
      wellState: {
        core: {
          well: [
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000000000
          ],
          score: 31
        },
        ai: undefined,
        piece: { id: 'S', x: 3, y: 0, o: 0 }
      }
    })
    expect(well.find('.well__cell--live')).toHaveLength(4)
  })

  it('game over well state', () => {
    const well = getWell({
      wellState: {
        core: {
          well: [
            0b0000000000,
            0b0000000000,
            0b0000000000,
            0b0000011000,
            0b0000110000,
            0b0000100000,
            0b0100100110,
            0b1111101111,
            0b0101111011,
            0b1101111111,
            0b1011111101,
            0b1001110101,
            0b1101111111,
            0b0110011111,
            0b1111011111,
            0b1111111110,
            0b1111011111,
            0b1111111110,
            0b1111111110,
            0b0110101010
          ],
          score: 31
        },
        ai: undefined,
        piece: null
      }
    })
    expect(well.find('.well__cell--landed')).toHaveLength(114)
  })
})
