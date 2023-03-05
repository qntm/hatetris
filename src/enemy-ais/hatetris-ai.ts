import type { CoreState, EnemyAi } from '../components/Game/Game.tsx'

// Maps seen wells to the number of times seen
type HatetrisAiState = {
  [key: string]: number
}

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
    currentAiState = {}
  }

  const wellKey = JSON.stringify(currentCoreState.well)
  const nextAiState = {
    ...currentAiState,
    [wellKey]: (wellKey in currentAiState ? currentAiState[wellKey] : 0) + 1
  }

  const evaluations = worstPieces
    .map((pieceId, pieceRanking) => {
      const nextCoreStates = getNextCoreStates(currentCoreState, pieceId)

      // Yes, test against `nextAiState` because what if the current width
      // is 4 and the candidate piece is an I which, if placed, leads back into
      // the current well?

      let maxLoops = -Infinity
      let highestPeak = -Infinity
      nextCoreStates.forEach(nextCoreState => {
        const wellKey = JSON.stringify(nextCoreState.well)
        const loops = wellKey in nextAiState ? nextAiState[wellKey] : 0
        if (loops > maxLoops) {
          maxLoops = loops
        }

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
        maxLoops,
        highestPeak,
        pieceRanking
      }
    })

  evaluations.sort((a, b) =>
    // Always prefer a piece which does NOT potentially lead into a previously
    // seen well. If all pieces lead into previously seen wells, choose the
    // well which has been seen the fewest times.
    (a.maxLoops - b.maxLoops) ||

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
