'use strict'

// TODO: this AI is needs to be made agnostic to the order of pieces
// given in the rotation system. At present it just returns whatever
// the first one is!

import Game from '../components/Game/Game.jsx'
import type { GameWellState } from '../components/Game/Game.jsx'

const moves = ['L', 'R', 'D', 'U']

const pieceRankings = {
  S: 1, // most preferable in a tie break
  Z: 2,
  O: 3,
  I: 4,
  L: 5,
  J: 6,
  T: 7 // least preferable in a tie break
}

const getHatetrisAi = (loveMode: boolean) => (game: Game) => {
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
  const hashCode = (x: number, y: number, o: number) =>
    (x * (wellDepth + 3) + y) * 4 + o

  /**
    Given a well and a piece ID, find all possible places where it could land
    and return the array of "possible future" states. All of these states
    will have `null` `piece` because the piece is landed; some will have
    an increased `score`.
  */
  const getPossibleFutures = (well: number[], pieceId: number): GameWellState[] => {
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

    const possibleFutures: GameWellState[] = []

    // A simple `forEach` won't work here because we are appending to the list as we go
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

  // Pick the worst piece that could be put into this well.
  // Rating is the row where the highest blue appears, or `wellDepth` if the well is empty.
  // For the player, higher is better because it indicates a lower stack.
  // For the AI, lower is better
  return (well: number[]): number => {
    const highestRatings = Object.keys(rotationSystem.rotations).map(pieceId => {
      let highestRating = -Infinity
      getPossibleFutures(well, pieceId).forEach(possibleFuture => {
        let rating = possibleFuture.well.findIndex(row => row !== 0)

        if (rating === -1) {
          // Well is completely empty after placing this piece in this location
          // (note: this is impossible in practice)
          rating = wellDepth
        }

        if (rating > highestRating) {
          highestRating = rating
        }
      })

      return { pieceId, highestRating }
    })

    highestRatings.sort((a, b) =>
      (a.highestRating - b.highestRating) ||

      // Tie breaker is piece ID rating
      pieceRankings[a.pieceId] - pieceRankings[b.pieceId]
    )

    return highestRatings[loveMode ? highestRatings.length - 1 : 0].pieceId
  }
}

export const HatetrisAi = getHatetrisAi(false)
export const LovetrisAi = getHatetrisAi(true)
