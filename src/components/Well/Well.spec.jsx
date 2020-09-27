/* eslint-env jest */

'use strict'

import { shallow } from 'enzyme'
import React from 'react'

import Well from './Well'
import hatetrisRotationSystem from '../../rotation-systems/hatetris-rotation-system'

const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4

describe('<Well>', () => {
  const getWell = props => shallow(
    <Well
      bar={bar}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={wellDepth}
      wellWidth={wellWidth}
      onClickL={jest.fn()}
      onClickR={jest.fn()}
      onClickU={jest.fn()}
      onClickD={jest.fn()}
      onClickZ={jest.fn()}
      onClickY={jest.fn()}
      wellState={null}
      {...props}
    />
  )

  it('null well state', () => {
    const onClickD = jest.fn()
    const well = getWell({ onClickD })
    expect(well).toMatchSnapshot()

    const downCell = well.find('tr').at(1).find('td').at(1)
    expect(downCell.text()).toBe('\u2193')
    expect(downCell.props().title).toBe('Press Down to move down')
    downCell.props().onClick()
    expect(onClickD).toHaveBeenCalled()
  })

  it('initial well state', () => {
    expect(getWell({
      wellState: {
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
        score: 31,
        piece: { id: '0', x: 3, y: 0, o: 0 }
      }
    })).toMatchSnapshot()
  })

  it('game over well state', () => {
    expect(getWell({
      wellState: {
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
        score: 31,
        piece: null
      }
    })).toMatchSnapshot()
  })
})
