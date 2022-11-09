import type { ReactElement } from 'react'

export type Piece = {
  x: number,
  y: number,
  o: number,
  id: string
}

export type CoreState = {
  score: number,
  well: number[],
}

export type WellState = {
  core: CoreState,
  ai: any,
  piece: Piece
}

export type Orientation = {
  yMin: number,
  yDim: number,
  xMin: number,
  xDim: number,
  rows: number[]
}

export type Rotations = {
  [pieceId: string]: Orientation[]
}

export type RotationSystem = {
  placeNewPiece: (wellWidth: number, pieceId: string) => Piece;
  rotations: Rotations
}

export type GetNextCoreStates = (core: CoreState, pieceId: string) => CoreState[]

export type EnemyAi = (
  currentCoreState: CoreState,
  currentAiState: any,
  getNextCoreStates: GetNextCoreStates
) => (string | [string, any] | Promise<string> | Promise<[string, any]>)

export type GameProps = {
  bar: number,
  replayTimeout: number,
  rotationSystem: RotationSystem,
  wellDepth: number,
  wellWidth: number
}

export type Enemy = {
  shortDescription: string | ReactElement,
  buttonDescription: string,
  ai: EnemyAi
}

export type GameState = {
  error: {
    interpretation: string,
    real: string,
    dismissable: boolean
  },
  displayEnemy: boolean,
  enemy: Enemy,
  customAiCode: string,
  mode: string,
  wellStateId: number,
  wellStates: WellState[],
  replay: any[],
  replayCopiedTimeoutId: ReturnType<typeof setTimeout>,
  replayTimeoutId: ReturnType<typeof setTimeout>
}

const moves = ['L', 'R', 'D', 'U']
const pieceIds = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

export const getLogic = ({
  bar,
  rotationSystem,
  wellDepth,
  wellWidth
}: GameProps) => {
  /**
    Generate a unique integer to describe the position and orientation of this piece.
    `x` varies between -3 and (`wellWidth` - 1) inclusive, so range = `wellWidth` + 3
    `y` varies between 0 and (`wellDepth` + 2) inclusive, so range = `wellDepth` + 3
    `o` varies between 0 and 3 inclusive, so range = 4
  */
  const getHashCode = (piece: Piece): number =>
    (piece.x * (wellDepth + 3) + piece.y) * 4 + piece.o

  /**
    Input {wellState, piece} and a move, return
    the new {wellState, piece}.
  */
  const getNextState = (wellState: WellState, move: string): WellState => {
    let nextWell = wellState.core.well
    let nextScore = wellState.core.score
    const nextAiState = wellState.ai
    let nextPiece = { ...wellState.piece }

    // apply transform
    if (move === 'L') {
      nextPiece.x--
    }
    if (move === 'R') {
      nextPiece.x++
    }
    if (move === 'D') {
      nextPiece.y++
    }
    if (move === 'U') {
      nextPiece.o = (nextPiece.o + 1) % 4
    }

    const orientation = rotationSystem.rotations[nextPiece.id][nextPiece.o]
    const xActual = nextPiece.x + orientation.xMin
    const yActual = nextPiece.y + orientation.yMin

    if (
      xActual < 0 || // off left side
      xActual + orientation.xDim > wellWidth || // off right side
      yActual < 0 || // off top (??)
      yActual + orientation.yDim > wellDepth || // off bottom
      orientation.rows.some((row, y) =>
        wellState.core.well[yActual + y] & (row << xActual)
      ) // obstruction
    ) {
      if (move === 'D') {
        // Lock piece
        nextWell = wellState.core.well.slice()

        const orientation = rotationSystem.rotations[wellState.piece.id][wellState.piece.o]

        // this is the top left point in the bounding box of this orientation of this piece
        const xActual = wellState.piece.x + orientation.xMin
        const yActual = wellState.piece.y + orientation.yMin

        // row by row bitwise line alteration
        for (let row = 0; row < orientation.yDim; row++) {
          // can't negative bit-shift, but alas X can be negative
          nextWell[yActual + row] |= (orientation.rows[row] << xActual)
        }

        // check for complete lines now
        // NOTE: completed lines don't count if you've lost
        for (let row = 0; row < orientation.yDim; row++) {
          if (
            yActual >= bar &&
            nextWell[yActual + row] === (1 << wellWidth) - 1
          ) {
            // move all lines above this point down
            for (let k = yActual + row; k > 1; k--) {
              nextWell[k] = nextWell[k - 1]
            }

            // insert a new blank line at the top
            // though of course the top line will always be blank anyway
            nextWell[0] = 0

            nextScore++
          }
        }
        nextPiece = null
      } else {
        // No move
        nextPiece = wellState.piece
      }
    }

    return {
      core: {
        well: nextWell,
        score: nextScore
      },
      ai: nextAiState,
      piece: nextPiece
    }
  }

  /**
    Given a well and a piece ID, find all possible places where it could land
    and return the array of "possible future" states. All of these states
    will have `null` `piece` because the piece is landed; some will have
    a positive `score`.
  */
  const getNextCoreStates = (core: CoreState, pieceId: string): CoreState[] => {
    let piece = rotationSystem.placeNewPiece(wellWidth, pieceId)

    // move the piece down to a lower position before we have to
    // start pathfinding for it
    // move through empty rows
    while (
      piece.y + 4 < wellDepth && // piece is above the bottom
      core.well[piece.y + 4] === 0 // nothing immediately below it
    ) {
      piece = getNextState({
        core,
        ai: undefined,
        piece
      }, 'D').piece
    }

    const piecePositions = [piece]

    const seen = new Set()
    seen.add(getHashCode(piece))

    const possibleFutures: CoreState[] = []

    // A simple `forEach` won't work here because we are appending to the list as we go
    let i = 0
    while (i < piecePositions.length) {
      piece = piecePositions[i]

      // apply all possible moves
      moves.forEach(move => {
        const nextState = getNextState({
          core,
          ai: undefined,
          piece
        }, move)
        const newPiece = nextState.piece

        if (newPiece === null) {
          // piece locked? better add that to the list
          // do NOT check locations, they aren't significant here
          possibleFutures.push(nextState.core)
        } else {
          // transform succeeded?
          // new location? append to list
          // check locations, they are significant
          const newHashCode = getHashCode(newPiece)

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

  const validateAiResult = async (enemy: Enemy, coreState: CoreState, aiState: any) => {
    const aiResult: string | [string, any] = await enemy.ai(coreState, aiState, getNextCoreStates)

    const [unsafePieceId, nextAiState] = Array.isArray(aiResult)
      ? aiResult
      : [aiResult, aiState]

    if (pieceIds.includes(unsafePieceId)) {
      return [unsafePieceId, nextAiState]
    }

    throw Error(`Bad piece ID: ${unsafePieceId}`)
  }

  const getFirstWellState = async ({ enemy }: GameState): Promise<WellState> => {
    const firstCoreState = {
      well: Array(wellDepth).fill(0),
      score: 0
    }

    const [firstPieceId, firstAiState] = await validateAiResult(enemy, firstCoreState, undefined)

    return {
      core: firstCoreState,
      ai: firstAiState,
      piece: rotationSystem.placeNewPiece(wellWidth, firstPieceId)
    }
  }

  /**
    Accepts the input of a move and attempts to apply that
    transform to the live piece in the live well.
    Returns the new state. Technically the new state could be partial but to
    satisfy the compiler make it whole
  */
  const handleMove = async (state: GameState, move: string): Promise<GameState> => {
    const {
      enemy,
      mode,
      replay,
      wellStateId,
      wellStates
    } = state
    const nextWellStateId = wellStateId + 1

    let nextReplay
    let nextWellStates

    if (wellStateId in replay && move === replay[wellStateId]) {
      nextReplay = replay
      nextWellStates = wellStates
    } else {
      // Push the new move
      nextReplay = replay.slice(0, wellStateId).concat([move])

      // And truncate the future
      nextWellStates = wellStates.slice(0, wellStateId + 1)
    }

    if (!(nextWellStateId in nextWellStates)) {
      const nextWellState = getNextState(nextWellStates[wellStateId], move)
      nextWellStates = [...nextWellStates, nextWellState]
    }

    const nextWellState = nextWellStates[nextWellStateId]

    // Is the game over?
    // It is impossible to get bits at row (bar - 2) or higher without getting a bit at
    // row (bar - 1), so there is only one line which we need to check.
    const gameIsOver = nextWellState.core.well[bar - 1] !== 0

    const nextMode = gameIsOver ? 'GAME_OVER' : mode

    // no live piece? make a new one
    // suited to the new world, of course
    if (nextWellState.piece === null && nextMode !== 'GAME_OVER') {
      let pieceId: string
      let aiState: any
      try {
        // TODO: `nextWellState.core.well` should be more complex and contain colour
        // information, whereas the well passed to the AI should be a simple
        // array of integers
        [pieceId, aiState] = await validateAiResult(enemy, nextWellState.core, nextWellState.ai)
      } catch (error) {
        console.error(error)
        return {
          ...state,
          error: {
            interpretation: 'Caught this exception while trying to generate a new piece using your custom AI. Game halted.',
            real: error.message,
            dismissable: true
          }
        }
      }

      nextWellState.ai = aiState
      nextWellState.piece = rotationSystem.placeNewPiece(wellWidth, pieceId)
    }

    return {
      ...state,
      mode: nextMode,
      wellStateId: nextWellStateId,
      wellStates: nextWellStates,
      replay: nextReplay
    }
  }

  return {
    getFirstWellState,
    getNextCoreStates,
    handleMove
  }
}
