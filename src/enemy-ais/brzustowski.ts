/*
  This is an implementation of "Algorithm 2" from John Brzustowski's 1992 paper
  "Can You Win At Tetris?" <https://open.library.ubc.ca/media/download/pdf/831/1.0079748/1>.

  """
    1. Send left kink and display left kink until a cycle is detected.
    2. Send one left kink and display right kink.
    3. Send right kink and display right kink until a cycle is detected.
    4. Send one right kink and display left kink.
    5. Go to step 1.
  """

  Here "left kink" means an S piece and "right kink" is a Z piece. Note: HATETRIS has no
  "display" (preview) piece, but nevertheless this behaviour is preserved in the algorithm below.

  On the topic of of detecting a cycle, the paper suggests creating a list of all of
  the states visited and adds,

  """
    Each time you enter step 1 or 2, the machine empties the list.
  """

  We believe this is a typographical error and Brzustowski intended to write "steps 1 or 3".

  This implementation intentionally avoids some fairly obvious optimisations, to make it more
  clear that it adheres to the original algorithm.
*/

import type { CoreState, EnemyAi } from '../components/Game/Game.jsx'

type Step = 1 | 2 | 3 | 4

type BrzAiState = {
  step: Step,
  displayPiece: 'S' | 'Z'
  seenWells: number[][]
}

export const brzAi: EnemyAi = (
  currentCoreState: CoreState,
  currentAiState: undefined | BrzAiState,
  getNextCoreStates: (
    coreState: CoreState,
    pieceId: string
  ) => CoreState[]
): [string, BrzAiState] => {
  if (currentAiState === undefined) {
    currentAiState = {
      step: 1,
      displayPiece: 'S',
      seenWells: []
    }
  }

  let nextAiState: BrzAiState

  if (currentAiState.step === 1) {
    const cycleDetected = currentAiState.seenWells.some(seenWell =>
      seenWell.every((row: number, y) =>
        row === currentCoreState.well[y]
      )
    )

    if (cycleDetected) {
      // Jump to next step
      nextAiState = {
        step: 2,
        displayPiece: 'Z',
        seenWells: [
          ...currentAiState.seenWells,
          currentCoreState.well
        ]
      }
    } else {
      // Stay on this step
      nextAiState = {
        step: 1,
        displayPiece: 'S',
        seenWells: [
          ...currentAiState.seenWells,
          currentCoreState.well
        ]
      }
    }
  } else if (currentAiState.step === 2) {
    nextAiState = {
      step: 3,
      displayPiece: 'Z',
      seenWells: []
    }
  } else if (currentAiState.step === 3) {
    const cycleDetected = currentAiState.seenWells.some(seenWell =>
      seenWell.every((row: number, y) =>
        row === currentCoreState.well[y]
      )
    )

    if (cycleDetected) {
      // Jump to next step
      nextAiState = {
        step: 4,
        displayPiece: 'S',
        seenWells: [
          ...currentAiState.seenWells,
          currentCoreState.well
        ]
      }
    } else {
      // Stay on this step
      nextAiState = {
        step: 3,
        displayPiece: 'Z',
        seenWells: [
          ...currentAiState.seenWells,
          currentCoreState.well
        ]
      }
    }
  } else {
    // Step 4
    nextAiState = {
      step: 1,
      displayPiece: 'S',
      seenWells: []
    }
  }

  return [currentAiState.displayPiece, nextAiState]
}
