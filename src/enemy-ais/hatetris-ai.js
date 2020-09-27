'use strict'

// TODO: this AI is needs to be made agnostic to the order of pieces
// given in the rotation system. At present it just returns whatever
// the first one is!

const moves = ['L', 'R', 'D', 'U']

const HatetrisAi = options => game => {
  const {
    rotationSystem,
    wellDepth,
    wellWidth
  } = game.props

  /**
    Generate a unique integer to describe the position and orientation of this piece.
    `x` varies between -3 and (`wellWidth` - 1) inclusive, so range = `wellWidth` + 3
    `y` varies between 0 and (`wellDepth` + 2) inclusive, so range = `wellDepth` + 3
    `o` varies between 0 and 3 inclusive, so range = 4
  */
  const hashCode = (x, y, o) =>
    (x * (wellDepth + 3) + y) * 4 + o

  /**
    Given a well and a piece ID, find all possible places where it could land
    and return the array of "possible future" states. All of these states
    will have `null` `piece` because the piece is landed; some will have
    an increased `score`.
  */
  const getPossibleFutures = (well, pieceId) => {
    let piece = rotationSystem.placeNewPiece(wellWidth, pieceId)

    // move the piece down to a lower position before we have to
    // start pathfinding for it
    // move through empty rows
    while (
      piece.y + 4 < wellDepth && // piece is above the bottom
      well[piece.y + 4] === 0 // nothing immediately below it
    ) {
      piece = game.getNextState({
        well: well,
        score: 0,
        piece: piece
      }, 'D').piece
    }

    // push first position
    const piecePositions = [piece]

    const seen = new Set()
    seen.add(hashCode(piece.x, piece.y, piece.o))

    const possibleFutures = []

    // a simple for loop won't work here because
    // we are increasing the list as we go
    let i = 0
    while (i < piecePositions.length) {
      piece = piecePositions[i]

      // apply all possible moves
      moves.forEach(move => {
        const nextState = game.getNextState({
          well: well,
          score: 0,
          piece: piece
        }, move)
        const newPiece = nextState.piece

        if (newPiece === null) {
          // piece locked? better add that to the list
          // do NOT check locations, they aren't significant here
          possibleFutures.push(nextState)
        } else {
          // transform succeeded?
          // new location? append to list
          // check locations, they are significant
          const newHashCode = hashCode(newPiece.x, newPiece.y, newPiece.o)

          if (!seen.has(newHashCode)) {
            piecePositions.push(newPiece)
            seen.add(newHashCode)
          }
        }
      })
      i++
    }

    return possibleFutures
  }

  const getHighestBlue = well => {
    let row
    for (row = 0; row < well.length; row++) {
      if (well[row] !== 0) {
        break
      }
    }
    return row
  }

  // deeper lines are worth less than immediate lines
  // this is so the game will never give you a line if it can avoid it
  // NOTE: make sure rating doesn't return a range of more than 100 values...
  const getWellRating = (well, depthRemaining) =>
    getHighestBlue(well) + (depthRemaining === 0 ? 0 : getWorstPieceDetails(well, depthRemaining - 1).rating / 100)

  /**
    Given a well and a piece, find the best possible location to put it.
    Return the best rating found.
  */
  const getBestWellRating = (well, pieceId, depthRemaining) =>
    Math.max.apply(Math, getPossibleFutures(well, pieceId).map(possibleFuture =>
      getWellRating(possibleFuture.well, depthRemaining)
    ))

  // pick the worst piece that could be put into this well
  const getWorstPieceDetails = (well, depthRemaining) =>
    Object
      .keys(rotationSystem.rotations)
      .map(pieceId => ({
        pieceId,
        rating: getBestWellRating(well, pieceId, depthRemaining)
      }))
      .sort((a, b) => a.rating - b.rating)[0]

  return well => getWorstPieceDetails(well, options.searchDepth).pieceId
}

export const Hatetris0 = HatetrisAi({ searchDepth: 0 })
export const Hatetris1 = HatetrisAi({ searchDepth: 1 })
