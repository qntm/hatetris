/* eslint-env jest */

import assert from 'node:assert'
import { render, screen } from '@testing-library/react'
import * as React from 'react'

import { Well } from './Well'
import type { WellProps } from './Well'
import hatetrisRotationSystem from '../../rotation-systems/hatetris-rotation-system'

const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4

describe('<Well>', () => {
  const renderWell = (props: Partial<WellProps> = {}) => render(
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
    renderWell()
    assert.strictEqual(screen.queryAllByTestId('well__cell').length, 190)
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--bar').length, 10)
  })

  it('initial well state', () => {
    renderWell({
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
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 4)
  })

  it('game over well state', () => {
    renderWell({
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
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--landed').length, 112)
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--bar well__cell--landed').length, 2)
  })
})
