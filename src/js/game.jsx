/**
  HATETRIS instance builder
*/

'use strict'

import React from 'react'

import getFirstState from './get-first-state'
import getGetNextState from './get-get-next-state'
import replayCodec from './replay'
import Well from './well.jsx'

const minWidth = 4

class Game extends React.Component {
  constructor (props) {
    super(props)

    const {
      rotationSystem,
      bar,
      wellDepth,
      wellWidth,
      getEnemyAi
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

    this.getNextState = getGetNextState(rotationSystem, bar, wellDepth, wellWidth)
    this.enemyAi = getEnemyAi(rotationSystem, this.getNextState, bar, wellDepth, wellWidth)
    this.firstState = getFirstState(wellWidth, wellDepth, rotationSystem, this.enemyAi)

    this.state = {
      mode: 'GAME_OVER',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayTimeoutId: undefined
    }

    this.handleClickStart = this.handleClickStart.bind(this)
    this.handleClickReplay = this.handleClickReplay.bind(this)
    this.inputReplayStep = this.inputReplayStep.bind(this)
    this.handleLeft = this.handleLeft.bind(this)
    this.handleRight = this.handleRight.bind(this)
    this.handleUp = this.handleUp.bind(this)
    this.handleDown = this.handleDown.bind(this)
    this.handleCtrlZ = this.handleCtrlZ.bind(this)
    this.handleCtrlY = this.handleCtrlY.bind(this)
  }

  handleClickStart () {
    const {
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    if (replayTimeoutId) {
      clearTimeout(replayTimeoutId)
    }

    // clear the field and get ready for a new game
    this.setState({
      mode: 'PLAYING',
      wellStateId: 0,
      wellStates: [this.firstState],
      replay: [],
      replayTimeoutId: undefined
    })
  }

  handleClickReplay () {
    const {
      replayTimeout
    } = this.props

    const {
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    if (replayTimeoutId) {
      clearTimeout(replayTimeoutId)
    }

    // user inputs replay string
    const string = window.prompt()

    const replay = replayCodec.decode(string)

    const wellStateId = 0
    const nextReplayTimeoutId = wellStateId in replay ? setTimeout(this.inputReplayStep, replayTimeout)
      : undefined

    // GO
    this.setState({
      mode: 'REPLAYING',
      wellStateId: wellStateId,
      wellStates: [this.firstState],
      replay: replay,
      replayTimeoutId: nextReplayTimeoutId
    })
  }

  inputReplayStep () {
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
      this.handleCtrlY()

      if (wellStateId + 1 in replay) {
        nextReplayTimeoutId = setTimeout(this.inputReplayStep, replayTimeout)
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
  handleMove (move) {
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
      nextWellStates = nextWellStates.slice().concat([nextWellState])
    }

    const nextWellState = nextWellStates[nextWellStateId]

    // Is the game over?
    // It is impossible to get bits at row (bar - 2) or higher without getting a bit at row (bar - 1),
    // so there is only one line which we need to check.
    const gameIsOver = nextWellState.well[bar - 1] !== 0

    const nextMode = gameIsOver ? 'GAME_OVER'
      : (mode === 'REPLAYING' && !(nextWellStateId in replay)) ? 'PLAYING'
        : mode

    // no live piece? make a new one
    // suited to the new world, of course
    if (nextWellState.piece === null && nextMode !== 'GAME_OVER') {
      // TODO: `nextWellState.well` should be more complex and contain colour
      // information, whereas the well passed to `enemyAi` should be a simple
      // array of integers
      nextWellState.piece = rotationSystem.placePiece(wellWidth, this.enemyAi(nextWellState.well))
    }

    this.setState({
      mode: nextMode,
      wellStateId: nextWellStateId,
      wellStates: nextWellStates,
      replay: nextReplay
    })
  }

  handleLeft () {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('L')
    } else {
      console.warn('Ignoring event L because mode is', mode)
    }
  }

  handleRight () {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('R')
    } else {
      console.warn('Ignoring event R because mode is', mode)
    }
  }

  handleDown () {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('D')
    } else {
      console.warn('Ignoring event D because mode is', mode)
    }
  }

  handleUp () {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      this.handleMove('U')
    } else {
      console.warn('Ignoring event U because mode is', mode)
    }
  }

  handleCtrlZ () {
    const {
      replayTimeoutId,
      wellStateId,
      wellStates
    } = this.state

    // There may be a replay in progress, this
    // must be killed
    if (replayTimeoutId) {
      clearTimeout(replayTimeoutId)
      this.setState({
        replayTimeoutId: undefined
      })
    }

    const nextWellStateId = wellStateId - 1
    if (nextWellStateId in wellStates) {
      this.setState({
        mode: 'PLAYING',
        wellStateId: nextWellStateId,
        replayTimeoutId: undefined
      })
    } else {
      console.warn('Ignoring undo event because start of history has been reached')
    }
  }

  handleCtrlY () {
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

  onKeyDown (event) {
    event = event || window.event // add for IE

    if (event.keyCode === 37) {
      this.handleLeft()
    } else if (event.keyCode === 39) {
      this.handleRight()
    } else if (event.keyCode === 40) {
      this.handleDown()
    } else if (event.keyCode === 38) {
      this.handleUp()
    } else if (event.keyCode === 90 && event.ctrlKey === true) {
      this.handleCtrlZ()
    } else if (event.keyCode === 89 && event.ctrlKey === true) {
      this.handleCtrlY()
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
    const replayOut = mode === 'GAME_OVER' && replay.length > 0 ? 'replay of last game: ' + replayCodec.encode(replay) : null

    return (
      <div className='hatetris'>
        <div className='hatetris__left'>
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
            onClickZ={this.handleCtrlZ}
            onClickY={this.handleCtrlY}
          />
        </div>
        <div className='hatetris__right'>
          <p className='hatetris__paragraph'>
            <a href='http://qntm.org/hatetris'>
              You're playing HATETRIS by qntm
            </a>
          </p>

          <p className='hatetris__paragraph'>
            <button type='button' onClick={this.handleClickStart}>
              start new game
            </button>
          </p>

          <p className='hatetris__paragraph'>
            <button type='button' onClick={this.handleClickReplay}>
              show a replay
            </button>
          </p>

          <p className='hatetris__paragraph'>
            <span className='hatetris__score'>
              {score}
            </span>
          </p>

          <p className='hatetris__paragraph'>
            <span className='hatetris__replay-out'>
              {replayOut}
            </span>
          </p>

          <div className='hatetris__spacer' />

          <p className='hatetris__paragraph'>
            Undo: Ctrl+Z<br />
            Redo: Ctrl+Y<br />
          </p>

          <p className='hatetris__paragraph'>
            <a href='https://github.com/qntm/hatetris'>source code</a>
          </p>

          <p className='hatetris__paragraph'>
            replays encoded using <a href='https://github.com/qntm/base2048'>Base2048</a><br />
          </p>
        </div>
      </div>
    )
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }
}

export default Game
