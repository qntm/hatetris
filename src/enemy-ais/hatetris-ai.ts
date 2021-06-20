'use strict'

import type { CoreState as State, EnemyAi } from '../components/Game/Game.jsx'

// S = worst for the player, T = best
const worstPieces = 'SZOILJT'.split('')

// Pick the worst piece that could be put into this well.
// Rating is the row where the highest blue appears, or `wellDepth` if the well is empty.
// For the player, higher is better because it indicates a lower stack.
// For the AI, lower is better
export const hatetrisAi: EnemyAi = (
  currentState: State,
  getNextStates: (
    state: State,
    pieceId: string
  ) => State[]
): string => {
  const highestRatings = worstPieces
    .map((pieceId, pieceRanking) => ({
      pieceId,
      pieceRanking,
      highestRating: Math.max(
        ...getNextStates(currentState, pieceId)
          .map(nextState => {
            const rating = nextState.well.findIndex((row: number) => row !== 0)

            return rating === -1
              // Well is completely empty after placing this piece in this location
              ? nextState.well.length
              : rating
          })
      )
    }))

  highestRatings.sort((a, b) =>
    (a.highestRating - b.highestRating) ||

    // Tie breaker is piece ID rating
    (a.pieceRanking - b.pieceRanking)
  )

  return highestRatings[0].pieceId
}
