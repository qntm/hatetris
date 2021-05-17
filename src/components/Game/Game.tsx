/**
  HATETRIS instance builder
*/

'use strict'

import * as React from 'react'

import hatetrisReplayCodec from '../../replay-codecs/hatetris-replay-codec'
import { Well } from '../Well/Well'
import './Game.css'

const minWidth = 4

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
  placeNewPiece: (wellWidth: number, pieceId: string) => any;
  rotations: Rotations
}

type GameWellState = {
  piece: any,
  score: number,
  well: number[],
}

type GameProps = {
  bar: any,
  replayTimeout: number,
  rotationSystem: RotationSystem,
  wellDepth: any,
  wellWidth: any,
  EnemyAi: any
}

type GameState = {
  enemyAi: any,
  firstWellState: GameWellState,
  mode: string,
  wellStateId: number,
  wellStates: GameWellState[],
  replay: any[],
  replayCopiedTimeoutId: ReturnType<typeof setTimeout>,
  replayTimeoutId: ReturnType<typeof setTimeout>
}

export type { GameWellState, GameProps, RotationSystem }

class Game extends React.Component<GameProps, GameState> {
  constructor (props: GameProps) {
    super(props)

    const {
      rotationSystem,
      bar,
      wellDepth,
      wellWidth,
      EnemyAi
    } = this.props

    if (Object.keys(rotationSystem.rotations).length < 1) {
      throw Error('Have to have at least one piece!')
    }

    if (wellDepth < bar) {
      throw Error("Can't have well with depth " + String(wellDepth) + ' less than bar at ' + String(bar))
    }

    if (wellWidth < minWidth) {
      throw Error("Can't have well with width " + String(wellWidth) + ' less than ' + String(minWidth))
    }

    const enemyAi = EnemyAi(this)

    const firstWell = Array(wellDepth).fill(0)

    const firstWellState = {
      well: firstWell,
      score: 0,
      piece: rotationSystem.placeNewPiece(wellWidth, enemyAi(firstWell))
    }

    this.state = {
      enemyAi,
      firstWellState,
      mode: 'INITIAL',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayCopiedTimeoutId: undefined,
      replayTimeoutId: undefined
    }
  }

  /**
    Input {wellState, piece} and a move, return
    the new {wellState, piece}.
  */
  getNextState (wellState: GameWellState, move: string): GameWellState {
    const {
      rotationSystem,
      bar,
      wellDepth,
      wellWidth
    } = this.props

    let nextWell = wellState.well
    let nextScore = wellState.score
    let nextPiece = {
      id: wellState.piece.id,
      x: wellState.piece.x,
      y: wellState.piece.y,
      o: wellState.piece.o
    }

    // apply transform (very fast now)
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
        wellState.well[yActual + y] & (row << xActual)
      ) // obstruction
    ) {
      if (move === 'D') {
        // Lock piece
        nextWell = wellState.well.slice()

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
      well: nextWell,
      score: nextScore,
      piece: nextPiece
    }
  }

  handleClickStart = () => {
    const {
      firstWellState,
      replayCopiedTimeoutId,
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)
    clearTimeout(replayCopiedTimeoutId)

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

  handleClickReplay = () => {
    const {
      replayTimeout
    } = this.props

    let {
      firstWellState,
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)

    // user inputs replay string
    const string = window.prompt()

    const replay = hatetrisReplayCodec.decode(string)
    // TODO: what if the replay is bad?

    const wellStateId = 0
    replayTimeoutId = wellStateId in replay
      ? setTimeout(this.handleReplayTimeout, replayTimeout)
      : undefined
    const mode = wellStateId in replay ? 'REPLAYING' : 'PLAYING'

    // GO
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
      enemyAi,
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
    const gameIsOver = nextWellState.well[bar - 1] !== 0

    const nextMode = gameIsOver ? 'GAME_OVER' : mode

    // no live piece? make a new one
    // suited to the new world, of course
    if (nextWellState.piece === null && nextMode !== 'GAME_OVER') {
      // TODO: `nextWellState.well` should be more complex and contain colour
      // information, whereas the well passed to `enemyAi` should be a simple
      // array of integers
      nextWellState.piece = rotationSystem.placeNewPiece(wellWidth, enemyAi(nextWellState.well))
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

  render () {
    const {
      bar,
      rotationSystem,
      wellDepth,
      wellWidth
    } = this.props

    const {
      mode,
      replay,
      replayCopiedTimeoutId,
      wellStateId,
      wellStates
    } = this.state

    const wellState = wellStateId === -1 ? null : wellStates[wellStateId]

    const score = wellState && wellState.score

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

            {score !== null && (
              <p className='game__paragraph e2e__score'>
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
          <div className='game__bottom game__bottom--initial'>
            <p className='game__paragraph'>
              <button
                className='game__button e2e__start-button'
                type='button'
                onClick={this.handleClickStart}
              >
                start new game
              </button>
            </p>

            <p className='game__paragraph'>
              <button
                className='game__button e2e__replay-button'
                type='button'
                onClick={this.handleClickReplay}
              >
                show a replay
              </button>
            </p>
          </div>
        )}

        {mode === 'PLAYING' && (
          <div className='game__bottom game__bottom--playing'>
            <div className='game__control-col'>
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
                onClick={this.handleLeft}
                title='Press Left to move left'
              >
                ←
              </button>
            </div>
            <div className='game__control-col'>
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
                type='button'
                onClick={this.handleDown}
                title='Press Down to move down'
              >
                ↓
              </button>
            </div>
            <div className='game__control-col'>
              <button
                className='game__button'
                disabled={!(wellStateId + 1 in wellStates)}
                type='button'
                onClick={this.handleRedo}
                title='Press Ctrl+Y to redo'
              >
                ↷
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
          <div className='game__bottom game__bottom--replaying'>
            replaying...
          </div>
        )}

        {mode === 'GAME_OVER' && (
          <div className='game__bottom game__bottom--game-over'>
            <p className='game__paragraph'>
              replay of last game:
            </p>
            <div className='game__replay-out e2e__replay-out'>
              {hatetrisReplayCodec.encode(replay)}
            </div>
            <div className='game__game-over-buttons'>
              <button
                className='game__button game__button--game-over e2e__replay-button'
                type='button'
                onClick={this.handleUndo}
              >
                undo last move
              </button>

              <button
                className='game__button game__button--game-over e2e__copy-replay'
                type='button'
                onClick={this.handleClickCopyReplay}
              >
                {replayCopiedTimeoutId ? 'copied!' : 'copy replay'}
              </button>

              <button
                className='game__button game__button--game-over e2e__done'
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
