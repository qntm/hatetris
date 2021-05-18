'use strict'

import type { GameWellState, EnemyAi } from '../components/Game/Game.jsx'

const pieceRankings = {
  S: 1, // most preferable to the AI in a tie break
  Z: 2,
  O: 3,
  I: 4,
  L: 5,
  J: 6,
  T: 7 // least preferable to the AI in a tie break
}

const getHatetrisAi = (loveMode: boolean): EnemyAi =>
  // Pick the worst piece that could be put into this well.
  // Rating is the row where the highest blue appears, or `wellDepth` if the well is empty.
  // For the player, higher is better because it indicates a lower stack.
  // For the AI, lower is better
  (
    well: number[],
    getPossibleFutures: (well: number[], pieceId: string) => GameWellState[]
  ): string => {
    const highestRatings = Object.entries(pieceRankings)
      .map(([pieceId, pieceRanking]) => ({
        pieceId,
        pieceRanking,
        highestRating: Math.max(
          ...getPossibleFutures(well, pieceId)
            .map(possibleFuture => {
              const rating = possibleFuture.well.findIndex(row => row !== 0)

              return rating === -1
                // Well is completely empty after placing this piece in this location
                // (note: this is impossible in practice)
                ? well.length
                : rating
            })
        )
      }))

    highestRatings.sort((a, b) =>
      (a.highestRating - b.highestRating) ||

      // Tie breaker is piece ID rating
      (a.pieceRanking - b.pieceRanking)
    )

    return highestRatings[loveMode ? highestRatings.length - 1 : 0].pieceId
  }

export const hatetrisAi = getHatetrisAi(false)
export const lovetrisAi = getHatetrisAi(true)
