'use strict'

import classnames from 'classnames'
import * as React from 'react'
import type { GameWellState } from '../Game/Game.jsx'

import './Well.css'

type WellProps = {
  bar: number;
  rotationSystem: any;
  wellDepth: number;
  wellWidth: number;
  wellState: GameWellState
}

type Cell = {
  landed: boolean,
  live: boolean
}

export type { WellProps }

export default (props: WellProps) => {
  const {
    bar,
    rotationSystem,
    wellDepth,
    wellWidth,
    wellState
  } = props

  const well = wellState && wellState.well
  const piece = wellState && wellState.piece

  const cellses: Cell[][] = []
  for (let y = 0; y < wellDepth; y++) {
    const cells = []
    for (let x = 0; x < wellWidth; x++) {
      const landed = well !== null && (well[y] & (1 << x)) !== 0

      let live
      if (piece === null) {
        live = false
      } else {
        const orientation = rotationSystem.rotations[piece.id][piece.o]
        const y2 = y - piece.y - orientation.yMin
        const x2 = x - piece.x - orientation.xMin
        live = (
          y2 >= 0 && y2 < orientation.yDim &&
          x2 >= 0 && x2 < orientation.xDim &&
          (orientation.rows[y2] & (1 << x2)) !== 0
        )
      }

      cells.push({ landed, live })
    }
    cellses.push(cells)
  }

  return (
    <table>
      <tbody>
        {cellses.map((cells, y) => (
          <tr key={y}>
            {cells.map((cell, x) => (
              <td
                key={x}
                className={classnames({
                  well__cell: true,
                  'well__cell--bar': y === bar,
                  'well__cell--landed': cell.landed,
                  'well__cell--live': cell.live
                })}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
