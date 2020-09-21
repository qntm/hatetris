'use strict'

export default (rotationSystem, bar, wellDepth, wellWidth) =>
  /**
    Input {well, score, piece} and a move, return
    the new {well, score, piece}.
  */
  (state, move) => {
    let nextWell = state.well
    let nextScore = state.score
    let nextPiece = {
      id: state.piece.id,
      x: state.piece.x,
      y: state.piece.y,
      o: state.piece.o
    }

    // apply transform (very fast now)
    if (move === 'L') {
      nextPiece.x--
    }
    if (move === 'R') {
      nextPiece.x++
    }
    if (move === 'D') {
      nextPiece.y++
    }
    if (move === 'U') {
      nextPiece.o = (nextPiece.o + 1) % 4
    }

    const orientation = rotationSystem.rotations[nextPiece.id][nextPiece.o]
    const xActual = nextPiece.x + orientation.xMin
    const yActual = nextPiece.y + orientation.yMin

    if (
      xActual < 0 || // off left side
      xActual + orientation.xDim > wellWidth || // off right side
      yActual < 0 || // off top (??)
      yActual + orientation.yDim > wellDepth || // off bottom
      orientation.rows.some((row, y) =>
        state.well[yActual + y] & (row << xActual)
      ) // obstruction
    ) {
      if (move === 'D') {
        // Lock piece
        nextWell = state.well.slice()

        const orientation = rotationSystem.rotations[state.piece.id][state.piece.o]

        // this is the top left point in the bounding box of this orientation of this piece
        const xActual = state.piece.x + orientation.xMin
        const yActual = state.piece.y + orientation.yMin

        // row by row bitwise line alteration
        for (let row = 0; row < orientation.yDim; row++) {
          // can't negative bit-shift, but alas X can be negative
          nextWell[yActual + row] |= (orientation.rows[row] << xActual)
        }

        // check for complete lines now
        // NOTE: completed lines don't count if you've lost
        for (let row = 0; row < orientation.yDim; row++) {
          if (
            yActual >= bar &&
            nextWell[yActual + row] === (1 << wellWidth) - 1
          ) {
            // move all lines above this point down
            for (let k = yActual + row; k > 1; k--) {
              nextWell[k] = nextWell[k - 1]
            }

            // insert a new blank line at the top
            // though of course the top line will always be blank anyway
            nextWell[0] = 0

            nextScore++
          }
        }
        nextPiece = null
      } else {
        // No move
        nextPiece = state.piece
      }
    }

    return {
      well: nextWell,
      score: nextScore,
      piece: nextPiece
    }
  }
