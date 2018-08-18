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
      placeFirstPiece,
      bar,
      wellDepth,
      wellWidth,
      enemyAi
    } = this.props

    if (rotationSystem.length < 1) {
      throw Error('Have to have at least one piece!')
    }

    if (wellDepth < bar) {
      throw Error("Can't have well with depth " + String(wellDepth) + ' less than bar at ' + String(bar))
    }

    if (wellWidth < minWidth) {
      throw Error("Can't have well with width " + String(wellWidth) + ' less than ' + String(minWidth))
    }

    this.firstState = getFirstState(wellDepth, placeFirstPiece, enemyAi)
    this.getNextState = getGetNextState(rotationSystem, bar, wellDepth, wellWidth)

    this.state = {
      mode: 'GAME_OVER',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayTimeoutId: undefined
    }

    this.startGame = this.startGame.bind(this)
    this.startReplay = this.startReplay.bind(this)
    this.inputReplayStep = this.inputReplayStep.bind(this)
    this.left = this.left.bind(this)
    this.right = this.right.bind(this)
    this.rotate = this.rotate.bind(this)
    this.down = this.down.bind(this)
    this.undo = this.undo.bind(this)
    this.redo = this.redo.bind(this)
  }

  startGame () {
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

  startReplay () {
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
    const string = window.prompt() || '' // change for IE

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
      this.redo()

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
      enemyAi,
      gameIsOver,
      placeFirstPiece
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

    const nextMode = gameIsOver(nextWellState) ? 'GAME_OVER'
      : (mode === 'REPLAYING' && !(nextWellStateId in replay)) ? 'PLAYING'
      : mode

    // no live piece? make a new one
    // suited to the new world, of course
    if (nextWellState.piece === null && nextMode !== 'GAME_OVER') {
      nextWellState.piece = placeFirstPiece(enemyAi(nextWellState.well))
    }

    this.setState({
      mode: nextMode,
      wellStateId: nextWellStateId,
      wellStates: nextWellStates,
      replay: nextReplay
    })
  }

  left () {
    const {mode} = this.state
    if (mode === 'PLAYING') {
      this.handleMove('L')
    } else {
      console.warn('Ignoring event L because mode is', mode)
    }
  }

  right () {
    const {mode} = this.state
    if (mode === 'PLAYING') {
      this.handleMove('R')
    } else {
      console.warn('Ignoring event R because mode is', mode)
    }
  }

  down () {
    const {mode} = this.state
    if (mode === 'PLAYING') {
      this.handleMove('D')
    } else {
      console.warn('Ignoring event D because mode is', mode)
    }
  }

  rotate () {
    const {mode} = this.state
    if (mode === 'PLAYING') {
      this.handleMove('U')
    } else {
      console.warn('Ignoring event U because mode is', mode)
    }
  }

  undo () {
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

  redo () {
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
      this.left()
    } else if (event.keyCode === 39) {
      this.right()
    } else if (event.keyCode === 40) {
      this.down()
    } else if (event.keyCode === 38) {
      this.rotate()
    } else if (event.keyCode === 90 && event.ctrlKey === true) {
      this.undo()
    } else if (event.keyCode === 89 && event.ctrlKey === true) {
      this.redo()
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
    const replayOut = mode === 'GAME_OVER' ? 'replay of last game: ' + replayCodec.encode(replay) : null

    return <div className='hatetris'>
      <div className='hatetris__left'>
        <Well
          bar={bar}
          rotationSystem={rotationSystem}
          wellDepth={wellDepth}
          wellWidth={wellWidth}
          wellState={wellState}
          onClickL={this.left}
          onClickR={this.right}
          onClickU={this.rotate}
          onClickD={this.down}
          onClickZ={this.undo}
          onClickY={this.redo}
        />
      </div>
      <div className='hatetris__right'>
        <p className='hatetris__paragraph'>
          <a href='http://qntm.org/hatetris'>
            You're playing HATETRIS by qntm
          </a>
        </p>

        <p className='hatetris__paragraph'>
          <button type='button' onClick={this.startGame}>
            start new game
          </button>
        </p>

        <p className='hatetris__paragraph'>
          <button type='button' onClick={this.startReplay}>
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
      </div>
    </div>
  }

  componentWillMount () {
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }
}

export default Game
