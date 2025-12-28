// HATETRIS as it was prior to June 2021 - without the loop prevention logic

import type { CoreState, EnemyAi } from '../components/Game/Game.tsx'

// S = worst for the player, T = best
const worstPieces = 'SZOILJT'.split('')

// Pick the worst piece which could be put into this well.
// Rating is the row where the highest blue appears, or `wellDepth` if the well is empty.
// For the player, higher is better because it indicates a lower stack.
// For the AI, lower is better
export const hatetrisMildAi: EnemyAi = (
  currentCoreState: CoreState,
  currentAiState: undefined,
  getNextCoreStates: (
    coreState: CoreState,
    pieceId: string
  ) => CoreState[]
): string => {
  const evaluations = worstPieces
    .map((pieceId, pieceRanking) => {
      const nextCoreStates = getNextCoreStates(currentCoreState, pieceId)

      let highestPeak = -Infinity
      nextCoreStates.forEach(nextCoreState => {
        let rating = nextCoreState.well.findIndex((row: number) => row !== 0)
        if (rating === -1) {
          // Well is completely empty after placing this piece in this location
          rating = nextCoreState.well.length
        }

        if (rating > highestPeak) {
          highestPeak = rating
        }
      })

      return {
        pieceId,
        highestPeak,
        pieceRanking
      }
    })

  evaluations.sort((a, b) =>
    // Prefer whichever piece gives the highest peak (lower number = higher peak)
    (a.highestPeak - b.highestPeak) ||

    // Tie breaker is piece ID rating
    (a.pieceRanking - b.pieceRanking)
  )

  return evaluations[0].pieceId
}
