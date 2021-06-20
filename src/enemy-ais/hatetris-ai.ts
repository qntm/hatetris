'use strict'

import type { CoreState, EnemyAi } from '../components/Game/Game.jsx'

type Seen = {
  well: number[],
  pieceIds: string[]
}

type HatetrisAiState = Array<Seen>

// S = worst for the player, T = best
const worstPieces = 'SZOILJT'.split('')

// Pick the worst piece that could be put into this well.
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
    currentAiState = []
  }

  const prevIndex = currentAiState
    .findIndex(({ well }) =>
      well.every((row: number, y) => row === currentCoreState.well[y])
    )

  const pastPieceIds = prevIndex === -1
    ? []
    : currentAiState[prevIndex].pieceIds

  const evaluations = worstPieces
    .map((pieceId, pieceRanking) => ({
      pieceId,
      alreadyGenerated: pastPieceIds.includes(pieceId) ? 1 : 0,
      highestPeak: Math.max(
        ...getNextCoreStates(currentCoreState, pieceId)
          .map(nextCoreState => {
            const rating = nextCoreState.well.findIndex((row: number) => row !== 0)

            return rating === -1
              // Well is completely empty after placing this piece in this location
              ? nextCoreState.well.length
              : rating
          })
      ),
      pieceRanking
    }))

  evaluations.sort((a, b) =>
    // Always prefer a piece which has never been generated before for this well over a piece
    // which has already been generated for this well.
    (a.alreadyGenerated - b.alreadyGenerated) ||

    // Otherwise, whichever piece gives the highest peak (lower number = higher peak)
    (a.highestPeak - b.highestPeak) ||

    // Tie breaker is piece ID rating
    (a.pieceRanking - b.pieceRanking)
  )

  return [evaluations[0].pieceId, undefined]
}
