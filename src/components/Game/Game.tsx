/**
  HATETRIS instance builder
*/

'use strict'

import * as React from 'react'

import hatetrisReplayCodec from '../../replay-codecs/hatetris-replay-codec'
import Well from '../Well/Well'
import './Game.css'

const minWidth = 4

type Orientation = {
  yMin: number,
  yDim: number,
  xMin: number,
  xDim: number,
  rows: number[]
}

type RotationSystem = {
  placeNewPiece: (wellWidth: number, pieceId: number) => any;
  rotations: Orientation[][]
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
  replayTimeoutId: ReturnType<typeof setTimeout>
}

export type { GameWellState, GameProps }

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

    if (rotationSystem.rotations.length < 1) {
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
      mode: 'GAME_OVER',
      wellStateId: -1,
      wellStates: [],
      replay: [],
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
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)

    // clear the field and get ready for a new game
    this.setState({
      mode: 'PLAYING',
      wellStateId: 0,
      wellStates: [firstWellState],
      replay: [],
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
      mode: mode,
      wellStateId: wellStateId,
      wellStates: [firstWellState],
      replay: replay,
      replayTimeoutId: replayTimeoutId
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
      nextWellStates = nextWellStates.slice().concat([nextWellState])
    }

    const nextWellState = nextWellStates[nextWellStateId]

    // Is the game over?
    // It is impossible to get bits at row (bar - 2) or higher without getting a bit at row (bar - 1),
    // so there is only one line which we need to check.
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

    if (event.key === 'Z' && event.ctrlKey === true) {
      this.handleUndo()
    }

    if (event.key === 'Y' && event.ctrlKey === true) {
      this.handleRedo()
    }
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
      wellStateId,
      wellStates
    } = this.state

    const wellState = wellStateId === -1 ? null : wellStates[wellStateId]

    const score = wellState && wellState.score
    const replayOut = mode === 'GAME_OVER' && replay.length > 0 && 'replay of last game: ' + hatetrisReplayCodec.encode(replay)

    return (
      <div className='game'>
        <div className='game__left'>
          <Well
            bar={bar}
            rotationSystem={rotationSystem}
            wellDepth={wellDepth}
            wellWidth={wellWidth}
            wellState={wellState}
            onClickL={this.handleLeft}
            onClickR={this.handleRight}
            onClickU={this.handleUp}
            onClickD={this.handleDown}
            onClickZ={this.handleUndo}
            onClickY={this.handleRedo}
          />
        </div>
        <div className='game__right'>
          <p className='game__paragraph'>
            <a href='http://qntm.org/hatetris'>
              You&apos;re playing HATETRIS by qntm
            </a>
          </p>

          <p className='game__paragraph'>
            <button className='game__start-button' type='button' onClick={this.handleClickStart}>
              start new game
            </button>
          </p>

          <p className='game__paragraph'>
            <button type='button' className='game__replay-button' onClick={this.handleClickReplay}>
              show a replay
            </button>
          </p>

          <p className='game__paragraph'>
            <span className='e2e__score'>
              {score}
            </span>
          </p>

          <p className='game__paragraph'>
            <span className='game__replay-out e2e__replay-out'>
              {replayOut}
            </span>
          </p>

          <div className='game__spacer' />

          <p className='game__paragraph'>
            Undo: Ctrl+Z<br />
            Redo: Ctrl+Y<br />
          </p>

          <p className='game__paragraph'>
            <a href='https://github.com/qntm/hatetris'>source code</a>
          </p>

          <p className='game__paragraph'>
            replays encoded using <a href='https://github.com/qntm/base2048'>Base2048</a><br />
          </p>
        </div>
      </div>
    )
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
  }

  componentWillUnmount () {
    const {
      replayTimeoutId
    } = this.state

    clearTimeout(replayTimeoutId)

    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }
}

export default Game
