'use strict'

import classnames from 'classnames'
import * as React from 'react'
import type { GameWellState } from '../Game/Game.tsx'

import './Well.css'

type WellProps = {
	bar: number;
	rotationSystem: any;
	wellDepth: number;
	wellWidth: number;
	onClickL: () => void;
	onClickR: () => void;
	onClickU: () => void;
	onClickD: () => void;
	onClickZ: () => void;
	onClickY: () => void;
	wellState: GameWellState
}

type Cell = {
	landed: boolean,
	live: boolean,
	handleClick?: () => void,
	symbol?: string,
	title?: string
}

export type { WellProps }

export default (props: WellProps) => {
  const {
    bar,
    rotationSystem,
    wellDepth,
    wellWidth,
    onClickL,
    onClickR,
    onClickU,
    onClickD,
    onClickZ,
    onClickY,
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
          (orientation.rows[y2] & (1 << x2))
        ) !== 0
      }

      cells.push({ landed, live })
    }
    cellses.push(cells)
  }

  // put some buttons on the playing field
  const buttons = [
    { y: 0, x: 0, handleClick: onClickZ, symbol: '\u21B6', title: 'Press Ctrl+Z to undo' },
    { y: 0, x: 1, handleClick: onClickU, symbol: '\u27F3', title: 'Press Up to rotate' },
    { y: 0, x: 2, handleClick: onClickY, symbol: '\u21B7', title: 'Press Ctrl+Y to redo' },
    { y: 1, x: 0, handleClick: onClickL, symbol: '\u2190', title: 'Press Left to move left' },
    { y: 1, x: 1, handleClick: onClickD, symbol: '\u2193', title: 'Press Down to move down' },
    { y: 1, x: 2, handleClick: onClickR, symbol: '\u2192', title: 'Press Right to move right' }
  ]

  buttons.forEach(button => {
    cellses[button.y][button.x].handleClick = button.handleClick
    cellses[button.y][button.x].symbol = button.symbol
    cellses[button.y][button.x].title = button.title
  })

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
                  'well__cell--manual': cell.handleClick,
                  'well__cell--landed': cell.landed,
                  'well__cell--live': cell.live
                })}
                onClick={cell.handleClick}
                title={cell.title}
              >
                {cell.symbol}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
