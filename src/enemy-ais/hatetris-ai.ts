'use strict'

import type { CoreState, EnemyAi } from '../components/Game/Game.jsx'

// Set containing stringified previously-seen wells
type HatetrisAiState = Set<String>

// S = worst for the player, T = best
const worstPieces = 'SZOILJT'.split('')

// Pick the worst piece which could be put into this well.
// Rating is the row where the highest blue appears, or `wellDepth` if the well is empty.
// For the player, higher is better because it indicates a lower stack.
// For the AI, lower is better
export const hatetrisAi: EnemyAi = (
  currentCoreState: CoreState,
  currentAiState: undefined | HatetrisAiState,
  getNextCoreStates: (
    coreState: CoreState,
    pieceId: string
  ) => CoreState[]
): [string, HatetrisAiState] => {
  if (currentAiState === undefined) {
    currentAiState = new Set()
  }

  const nextAiState = new Set([
    ...currentAiState,
    JSON.stringify(currentCoreState.well)
  ])

  const evaluations = worstPieces
    .map((pieceId, pieceRanking) => {
      const nextCoreStates = getNextCoreStates(currentCoreState, pieceId)

      // Yes, test against `nextAiState` because what if the current width
      // is 4 and the candidate piece is an I which, if placed, leads back into
      // the current well?
      const leadsIntoCycle = Number(nextCoreStates.some(nextCoreState =>
        nextAiState.has(JSON.stringify(nextCoreState.well))
      ))

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
        leadsIntoCycle,
        highestPeak,
        pieceRanking
      }
    })

  evaluations.sort((a, b) =>
    // Always prefer a piece which does NOT potentially lead into a previously
    // seen well.
    (a.leadsIntoCycle - b.leadsIntoCycle) ||

    // Otherwise, whichever piece gives the highest peak (lower number = higher peak)
    (a.highestPeak - b.highestPeak) ||

    // Tie breaker is piece ID rating
    (a.pieceRanking - b.pieceRanking)
  )

  const pieceId = evaluations[0].pieceId

  return [
    pieceId,
    nextAiState
  ]
}
