'use strict'

import type { CoreState as State, EnemyAiConstructor, EnemyAi } from '../components/Game/Game.jsx'

// Pick the worst piece that could be put into this well.
// Rating is the row where the highest blue appears, or `wellDepth` if the well is empty.
// For the player, higher is better because it indicates a lower stack.
// For the AI, lower is better
export const HatetrisAi: EnemyAiConstructor = (getNextStates: (
  pieceId: string,
  state: State
) => State[]): EnemyAi => {
  // 1 = worst for the player, 7 = best
  const pieceRankings = { S: 1, Z: 2, O: 3, I: 4, L: 5, J: 6, T: 7 }

  return (state: State): string => {
    const highestRatings = Object.entries(pieceRankings)
      .map(([pieceId, pieceRanking]) => ({
        pieceId,
        pieceRanking,
        highestRating: Math.max(
          ...getNextStates(pieceId, state)
            .map(nextState => {
              const rating = nextState.well.findIndex((row: number) => row !== 0)

              return rating === -1
                // Well is completely empty after placing this piece in this location
                // (note: this is impossible in practice)
                ? state.well.length
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
}

// golfed:
// g=>c=>[...'SZOILJT'].map((p,s)=>({p,s,h:Math.max(...g(p,c).map(n=>[...n.well,1].findIndex(r=>r)))})).sort((a,b)=>a.h-b.h||a.s-b.s)[0].p
