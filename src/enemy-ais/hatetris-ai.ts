import type { CoreState, EnemyAi } from '../components/Game/Game.tsx'
import { Tree } from './tree.ts'

// Map a well state (an array of 20 integers) to the points in history where this well was seen.
// If this well has never been seen the map stores `undefined` or an empty array
type Lookup = Tree<number, number[]>
type HatetrisAiState = Readonly<{
  // this value is different for every `HatetrisAiState` object
  // in the memory of a given game of HATETRIS
  numWellsSeen: number

  // this object, by contrast, is SHARED across all the `HatetrisAiState` objects
  // in that game
  shared: {
    // this is the mutable sum of the lengths of all entries in the tree
    numWellsSeen: number

    readonly lookup: Tree<
      number,
      number[] // array of points in history where this well was seen
    >
  }
}>

// S = worst for the player, T = best
const WORST_PIECES = 'SZOILJT'.split('')

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
    currentAiState = {
      numWellsSeen: 0,
      shared: {
        numWellsSeen: 0,
        lookup: new Tree()
      }
    }
  }

  if (currentAiState.numWellsSeen < currentAiState.shared.numWellsSeen) {
    // Looks like we undid some steps and we are now redoing.
    // Delete all records from the "future"
    for (const [path, sightings] of currentAiState.shared.lookup.entries()) {
      for (let i = 0; i < sightings.length; i++) {
        const sighting = sightings[i]
        if (sighting >= currentAiState.numWellsSeen) {
          sightings.splice(i, sightings.length - i)
          break
        }
      }
    }
    currentAiState.shared.numWellsSeen = currentAiState.numWellsSeen
  }

  const shared = currentAiState.shared
  const sightings = shared.lookup.get(currentCoreState.well)
  if (sightings === undefined) {
    shared.lookup.set(currentCoreState.well, [shared.numWellsSeen])
  } else {
    sightings.push(shared.numWellsSeen)
  }
  shared.numWellsSeen++

  const nextAiState = {
    numWellsSeen: currentAiState.numWellsSeen + 1,
    shared // yes, reuse the same object for efficiency
  }

  const evaluations = WORST_PIECES
    .map((pieceId, pieceRanking) => {
      const nextCoreStates = getNextCoreStates(currentCoreState, pieceId)

      // Yes, test against `nextAiState` because what if the current width
      // is 4 and the candidate piece is an I which, if placed, leads back into
      // the current well?

      let maxLoops = -Infinity
      let highestPeak = -Infinity
      nextCoreStates.forEach(nextCoreState => {
        const loops = (shared.lookup.get(nextCoreState.well) ?? []).length
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
