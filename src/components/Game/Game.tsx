/**
  HATETRIS instance builder
*/

'use strict'

import * as React from 'react'
import type { ReactElement } from 'react'

import { hatetrisAi } from '../../enemy-ais/hatetris-ai'
import { lovetrisAi } from '../../enemy-ais/lovetris-ai'
import { brzAi } from '../../enemy-ais/brzustowski'
import { burgAi } from '../../enemy-ais/burgiel'
import hatetrisReplayCodec from '../../replay-codecs/hatetris-replay-codec'
import { Well } from '../Well/Well'
import './Game.css'

const minWidth = 4

const moves = ['L', 'R', 'D', 'U']

type Piece = {
  x: number,
  y: number,
  o: number,
  id: string
}

type Orientation = {
  yMin: number,
  yDim: number,
  xMin: number,
  xDim: number,
  rows: number[]
}

type Rotations = {
  [pieceId: string]: Orientation[]
}

type RotationSystem = {
  placeNewPiece: (wellWidth: number, pieceId: string) => Piece;
  rotations: Rotations
}

type CoreState = {
  score: number,
  well: number[],
}

type WellState = {
  core: CoreState,
  ai: any,
  piece: Piece
}

type GetNextCoreStates = (core: CoreState, pieceId: string) => CoreState[]

type EnemyAi = (
  currentCoreState: CoreState,
  currentAiState: any,
  getNextCoreStates: GetNextCoreStates
) => (string | [string, any])

type Enemy = {
  shortDescription: string | ReactElement,
  buttonDescription: string,
  ai: EnemyAi
}

type GameProps = {
  bar: number,
  replayTimeout: number,
  rotationSystem: RotationSystem,
  wellDepth: number,
  wellWidth: number
}

type GameState = {
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

export type { CoreState, WellState, GameProps, RotationSystem, EnemyAi }

export const hatetris: Enemy = {
  shortDescription: 'HATETRIS',
  buttonDescription: 'HATETRIS, the original and worst',
  ai: hatetrisAi
}

export const lovetris: Enemy = {
  shortDescription: '❤️',
  buttonDescription: 'all 4x1 pieces, all the time',
  ai: lovetrisAi
}

export const brz: Enemy = {
  shortDescription: (
    <a
      href='https://open.library.ubc.ca/media/download/pdf/831/1.0079748/1'
    >
      Brzustowski
    </a>
  ),
  buttonDescription: 'Brzustowski (1992)',
  ai: brzAi
}

const burg: Enemy = {
  shortDescription: (
    <a
      href='https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.55.8562&rep=rep1&type=pdf'
    >
      Burgiel
    </a>
  ),
  buttonDescription: 'Burgiel (1997)',
  ai: burgAi
}

const enemies = [hatetris, lovetris, brz, burg]

const pieceIds = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

class Game extends React.Component<GameProps, GameState> {
  constructor (props: GameProps) {
    super(props)

    const {
      rotationSystem,
      bar,
      wellDepth,
      wellWidth
    } = this.props

    let error

    if (Object.keys(rotationSystem.rotations).length < 1) {
      error = Error('Have to have at least one piece!')
    }

    if (wellDepth < bar) {
      error = Error("Can't have well with depth " + String(wellDepth) + ' less than bar at ' + String(bar))
    }

    if (wellWidth < minWidth) {
      error = Error("Can't have well with width " + String(wellWidth) + ' less than ' + String(minWidth))
    }

    this.state = {
      error: error
        ? {
            interpretation: 'Caught this exception while trying to start HATETRIS. Application halted.',
            real: error.message,
            dismissable: false
          }
        : null,
      displayEnemy: false, // don't show it unless the user selects one manually
      enemy: hatetris,
      customAiCode: '',
      mode: 'INITIAL',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayCopiedTimeoutId: undefined,
      replayTimeoutId: undefined
    }
  }

  validateAiResult (coreState: CoreState, aiState: any) {
    const {
      enemy
    } = this.state

    const aiResult: any = enemy.ai(coreState, aiState, this.getNextCoreStates)

    const [unsafePieceId, nextAiState] = Array.isArray(aiResult)
      ? aiResult
      : [aiResult, aiState]

    if (pieceIds.includes(unsafePieceId)) {
      return [unsafePieceId, nextAiState]
    }

    throw Error(`Bad piece ID: ${unsafePieceId}`)
  }

  getFirstWellState (): WellState {
    const {
      rotationSystem,
      wellDepth,
      wellWidth
    } = this.props

    const firstCoreState = {
      well: Array(wellDepth).fill(0),
      score: 0
    }

    const [firstPieceId, firstAiState] = this.validateAiResult(firstCoreState, undefined)

    return {
      core: firstCoreState,
      ai: firstAiState,
      piece: rotationSystem.placeNewPiece(wellWidth, firstPieceId)
    }
  }

  /**
    Generate a unique integer to describe the position and orientation of this piece.
    `x` varies between -3 and (`wellWidth` - 1) inclusive, so range = `wellWidth` + 3
    `y` varies between 0 and (`wellDepth` + 2) inclusive, so range = `wellDepth` + 3
    `o` varies between 0 and 3 inclusive, so range = 4
  */
  hashCode = (piece: Piece): number =>
    (piece.x * (this.props.wellDepth + 3) + piece.y) * 4 + piece.o

  /**
    Given a well and a piece ID, find all possible places where it could land
    and return the array of "possible future" states. All of these states
    will have `null` `piece` because the piece is landed; some will have
    a positive `score`.
  */
  getNextCoreStates: GetNextCoreStates = (core: CoreState, pieceId: string): CoreState[] => {
    const {
      rotationSystem,
      wellDepth,
      wellWidth
    } = this.props

    let piece = rotationSystem.placeNewPiece(wellWidth, pieceId)

    // move the piece down to a lower position before we have to
    // start pathfinding for it
    // move through empty rows
    while (
      piece.y + 4 < wellDepth && // piece is above the bottom
      core.well[piece.y + 4] === 0 // nothing immediately below it
    ) {
      piece = this.getNextState({
        core,
        ai: undefined,
        piece
      }, 'D').piece
    }

    const piecePositions = [piece]

    const seen = new Set()
    seen.add(this.hashCode(piece))

    const possibleFutures: CoreState[] = []

    // A simple `forEach` won't work here because we are appending to the list as we go
    let i = 0
    while (i < piecePositions.length) {
      piece = piecePositions[i]

      // apply all possible moves
      moves.forEach(move => {
        const nextState = this.getNextState({
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
          const newHashCode = this.hashCode(newPiece)

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

  /**
    Input {wellState, piece} and a move, return
    the new {wellState, piece}.
  */
  getNextState (wellState: WellState, move: string): WellState {
    const {
      rotationSystem,
      bar,
      wellDepth,
      wellWidth
    } = this.props

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

  handleClickStart = () => {
    const {
      replayCopiedTimeoutId,
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)
    clearTimeout(replayCopiedTimeoutId)

    let firstWellState: WellState
    try {
      firstWellState = this.getFirstWellState()
    } catch (error) {
      console.error(error)
      this.setState({
        error: {
          interpretation: 'Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.',
          real: error.message,
          dismissable: true
        }
      })
      return
    }

    // clear the field and get ready for a new game
    this.setState({
      mode: 'PLAYING',
      wellStateId: 0,
      wellStates: [firstWellState],
      replay: [],
      replayCopiedTimeoutId: undefined,
      replayTimeoutId: undefined
    })
  }

  handleClickSelectAi = () => {
    this.setState({
      mode: 'SELECT_AI'
    })
  }

  handleClickReplay = () => {
    const {
      replayTimeout
    } = this.props

    let {
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)

    // user inputs replay string
    const string = window.prompt('Paste replay string...')

    if (string === null) {
      return
    }

    const replay = hatetrisReplayCodec.decode(string)
    // TODO: what if the replay is bad?

    let firstWellState: WellState
    try {
      firstWellState = this.getFirstWellState()
    } catch (error) {
      console.error(error)
      this.setState({
        error: {
          interpretation: 'Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.',
          real: error.message,
          dismissable: true
        }
      })
      return
    }

    const wellStateId = 0
    replayTimeoutId = wellStateId in replay
      ? setTimeout(this.handleReplayTimeout, replayTimeout)
      : undefined
    const mode = wellStateId in replay ? 'REPLAYING' : 'PLAYING'

    // GO.
    this.setState({
      mode,
      wellStateId,
      wellStates: [firstWellState],
      replay,
      replayTimeoutId
    })
  }

  handleReplayTimeout = () => {
    const {
      replayTimeout
    } = this.props

    const {
      mode,
      replay,
      wellStateId
    } = this.state

    let nextReplayTimeoutId

    if (mode === 'REPLAYING') {
      this.handleRedo()

      if (wellStateId + 1 in replay) {
        nextReplayTimeoutId = setTimeout(this.handleReplayTimeout, replayTimeout)
      }
    } else {
      console.warn('Ignoring input replay step because mode is', mode)
    }

    this.setState({
      replayTimeoutId: nextReplayTimeoutId
    })
  }

  // Accepts the input of a move and attempts to apply that
  // transform to the live piece in the live well.
  // Returns the new state.
  handleMove (move: string) {
    const {
      bar,
      rotationSystem,
      wellWidth
    } = this.props

    const {
      mode,
      replay,
      wellStateId,
      wellStates
    } = this.state

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
      const nextWellState = this.getNextState(nextWellStates[wellStateId], move)
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
        [pieceId, aiState] = this.validateAiResult(nextWellState.core, nextWellState.ai)
      } catch (error) {
        console.error(error)
        this.setState({
          error: {
            interpretation: 'Caught this exception while trying to generate a new piece using your custom AI. Game halted.',
            real: error.message,
            dismissable: true
          }
        })
        return
      }

      nextWellState.ai = aiState
      nextWellState.piece = rotationSystem.placeNewPiece(wellWidth, pieceId)
    }

    this.setState({
      mode: nextMode,
      wellStateId: nextWellStateId,
      wellStates: nextWellStates,
      replay: nextReplay
    })
  }

  handleLeft = () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('L')
    } else {
      console.warn('Ignoring event L because mode is', mode)
    }
  }

  handleRight = () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('R')
    } else {
      console.warn('Ignoring event R because mode is', mode)
    }
  }

  handleDown = () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('D')
    } else {
      console.warn('Ignoring event D because mode is', mode)
    }
  }

  handleUp = () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('U')
    } else {
      console.warn('Ignoring event U because mode is', mode)
    }
  }

  handleUndo = () => {
    const {
      replayTimeoutId,
      wellStateId,
      wellStates
    } = this.state

    // There may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)
    this.setState({
      replayTimeoutId: undefined
    })

    const nextWellStateId = wellStateId - 1
    if (nextWellStateId in wellStates) {
      this.setState({
        mode: 'PLAYING',
        wellStateId: nextWellStateId
      })
    } else {
      console.warn('Ignoring undo event because start of history has been reached')
    }
  }

  handleRedo = () => {
    const {
      mode,
      replay,
      wellStateId
    } = this.state

    if (mode === 'PLAYING' || mode === 'REPLAYING') {
      if (wellStateId in replay) {
        this.handleMove(replay[wellStateId])
      } else {
        console.warn('Ignoring redo event because end of history has been reached')
      }
    } else {
      console.warn('Ignoring redo event because mode is', mode)
    }
  }

  handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Left' || event.key === 'ArrowLeft') {
      this.handleLeft()
    }

    if (event.key === 'Right' || event.key === 'ArrowRight') {
      this.handleRight()
    }

    if (event.key === 'Down' || event.key === 'ArrowDown') {
      this.handleDown()
    }

    if (event.key === 'Up' || event.key === 'ArrowUp') {
      this.handleUp()
    }

    if (event.key === 'z' && event.ctrlKey === true) {
      this.handleUndo()
    }

    if (event.key === 'y' && event.ctrlKey === true) {
      this.handleRedo()
    }
  }

  handleClickCopyReplay = () => {
    const {
      replay
    } = this.state

    return navigator.clipboard.writeText(hatetrisReplayCodec.encode(replay))
      .then(() => {
        const replayCopiedTimeoutId = setTimeout(this.handleCopiedTimeout, 3000)
        this.setState({
          replayCopiedTimeoutId
        })
      })
  }

  handleCopiedTimeout = () => {
    this.setState({
      replayCopiedTimeoutId: undefined
    })
  }

  handleClickDone = () => {
    this.setState({
      mode: 'INITIAL'
    })
  }

  handleClickEnemy = (enemy: Enemy) => {
    this.setState({
      displayEnemy: true,
      enemy,
      mode: 'INITIAL'
    })
  }

  handleClickCustomEnemy = () => {
    this.setState({
      mode: 'PASTE'
    })
  }

  handleCancelCustomEnemy = () => {
    this.setState({
      mode: 'SELECT_AI'
    })
  }

  handleCustomAiChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      customAiCode: event.target.value
    })
  }

  handleSubmitCustomEnemy = () => {
    const {
      customAiCode
    } = this.state

    let ai: EnemyAi
    try {
      // eslint-disable-next-line no-new-func
      ai = Function(`
        "use strict"
        return (${customAiCode})
      `)()
    } catch (error) {
      console.error(error)
      this.setState({
        error: {
          interpretation: 'Caught this exception while trying to evaluate your custom AI JavaScript.',
          real: error.message,
          dismissable: true
        }
      })
      return
    }

    this.handleClickEnemy({
      shortDescription: 'custom',
      buttonDescription: 'this is never actually used',
      ai
    })
  }

  handleClickDismissError = () => {
    this.setState({
      error: null
    })
  }

  render () {
    const {
      bar,
      rotationSystem,
      wellDepth,
      wellWidth
    } = this.props

    const {
      customAiCode,
      displayEnemy,
      enemy,
      error,
      mode,
      replay,
      replayCopiedTimeoutId,
      wellStateId,
      wellStates
    } = this.state

    const wellState = wellStateId === -1 ? null : wellStates[wellStateId]

    const score = wellState && wellState.core.score

    if (error !== null) {
      return (
        <div className='game'>
          <h2 style={{ fontWeight: 'bold', fontSize: '150%' }}>Error</h2>
          <p data-testid='error-real'>
            <code style={{ fontFamily: 'monospace' }}>{error.real}</code>
          </p>
          <p data-testid='error-interpretation'>
            {error.interpretation}
          </p>

          {error.dismissable && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>To fix this</h3>
              <p>
                Check your browser console for more information.
                Use this information to fix your AI code and submit it again.
                Or, use one of the preset AIs instead.
              </p>

              <p>
                <button
                  data-testid='dismiss-error'
                  className='game__button'
                  type='button'
                  onClick={this.handleClickDismissError}
                >
                  OK
                </button>
              </p>
            </>
          )}

          {!error.dismissable && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>To fix this</h3>
              <p>Report this problem to qntm.</p>
            </>
          )}
        </div>
      )
    }

    return (
      <div className='game'>
        <div className='game__top'>
          <div className='game__topleft'>
            <Well
              bar={bar}
              rotationSystem={rotationSystem}
              wellDepth={wellDepth}
              wellWidth={wellWidth}
              wellState={wellState}
            />
          </div>
          <div className='game__topright'>
            <p className='game__paragraph'>
              you&apos;re playing <b>HATETRIS</b> by qntm
            </p>

            {displayEnemy && (
              <p
                data-testid='enemy-short'
                className='game__paragraph'
              >
                AI: {enemy.shortDescription}
              </p>
            )}

            {score !== null && (
              <p
                data-testid='score'
                className='game__paragraph'
              >
                score: {score}
              </p>
            )}

            <div className='game__spacer' />

            <p className='game__paragraph'>
              <a href='http://qntm.org/hatetris'>
                about
              </a>
            </p>

            <p className='game__paragraph'>
              <a href='https://github.com/qntm/hatetris'>
                source code
              </a>
            </p>

            <p className='game__paragraph'>
              replays encoded using <a href='https://github.com/qntm/base2048'>Base2048</a>
            </p>
          </div>
        </div>

        {mode === 'INITIAL' && (
          <div className='game__bottom'>
            <button
              data-testid='start-button'
              className='game__button'
              type='button'
              onClick={this.handleClickStart}
            >
              start new game
            </button>

            <div className='game__paragraph' style={{ display: 'flex', gap: '10px' }}>
              <button
                data-testid='replay-button'
                className='game__button'
                type='button'
                onClick={this.handleClickReplay}
              >
                show a replay
              </button>

              <button
                data-testid='select-ai'
                className='game__button'
                type='button'
                onClick={this.handleClickSelectAi}
              >
                select AI
              </button>
            </div>
          </div>
        )}

        {mode === 'SELECT_AI' && (
          <div className='game__bottom game__bottom--select-ai'>
            <p>
              Select AI:
            </p>
            {
              enemies.map(enemy => (
                <button
                  data-testid='enemy'
                  className='game__button'
                  key={enemy.buttonDescription}
                  type='button'
                  onClick={() => this.handleClickEnemy(enemy)}
                >
                  {enemy.buttonDescription}
                </button>
              ))
            }

            <button
              data-testid='custom-enemy'
              className='game__button'
              type='button'
              onClick={this.handleClickCustomEnemy}
            >
              use custom AI
            </button>
          </div>
        )}

        {mode === 'PASTE' && (
          <div className='game__bottom'>
            <p>Enter custom code:</p>
            <div>
              <textarea
                autoFocus
                style={{ width: '100%' }}
                onChange={this.handleCustomAiChange}
                data-testid='ai-textarea'
                defaultValue={customAiCode}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <p style={{ flex: '1 1 100%' }}>
                <a href="https://github.com/qntm/hatetris#writing-a-custom-ai">
                  how to write a custom AI
                </a>
              </p>
              <button
                data-testid='cancel-custom-enemy'
                className='game__button'
                type='button'
                onClick={this.handleCancelCustomEnemy}
              >
                cancel
              </button>
              <button
                data-testid='submit-custom-enemy'
                className='game__button'
                type='button'
                onClick={this.handleSubmitCustomEnemy}
              >
                go
              </button>
            </div>
          </div>
        )}

        {mode === 'PLAYING' && (
          <div className='game__bottom'>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className='game__button'
                disabled={!(wellStateId - 1 in wellStates)}
                type='button'
                onClick={this.handleUndo}
                title='Press Ctrl+Z to undo'
              >
                ↶
              </button>
              <button
                className='game__button'
                type='button'
                onClick={this.handleUp}
                title='Press Up to rotate'
              >
                ⟳
              </button>
              <button
                className='game__button'
                disabled={!(wellStateId + 1 in wellStates)}
                type='button'
                onClick={this.handleRedo}
                title='Press Ctrl+Y to redo'
              >
                ↷
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className='game__button'
                type='button'
                onClick={this.handleLeft}
                title='Press Left to move left'
              >
                ←
              </button>
              <button
                data-testid='down'
                className='game__button'
                type='button'
                onClick={this.handleDown}
                title='Press Down to move down'
              >
                ↓
              </button>
              <button
                className='game__button'
                type='button'
                onClick={this.handleRight}
                title='Press Right to move right'
              >
                →
              </button>
            </div>
          </div>
        )}

        {mode === 'REPLAYING' && (
          <div
            data-testid='bottom'
            className='game__bottom'
          >
            replaying...
          </div>
        )}

        {mode === 'GAME_OVER' && (
          <div
            data-testid='bottom'
            className='game__bottom'
          >
            <div>
              replay of last game:
            </div>
            <div
              data-testid='replay-out'
              className='game__replay-out'
            >
              {hatetrisReplayCodec.encode(replay)}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className='game__button'
                type='button'
                onClick={this.handleUndo}
              >
                undo last move
              </button>

              <button
                data-testid='copy-replay'
                className='game__button'
                type='button'
                onClick={this.handleClickCopyReplay}
              >
                {replayCopiedTimeoutId ? 'copied!' : 'copy replay'}
              </button>

              <button
                data-testid='done'
                className='game__button'
                type='button'
                onClick={this.handleClickDone}
              >
                done
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
  }

  componentWillUnmount () {
    const {
      replayCopiedTimeoutId,
      replayTimeoutId
    } = this.state

    clearTimeout(replayCopiedTimeoutId)
    clearTimeout(replayTimeoutId)

    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }
}

export default Game
