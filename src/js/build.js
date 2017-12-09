/**
  HATETRIS instance builder
*/

'use strict'

import ReactDOM from 'react-dom'
import getFirstState from './get-first-state'
import getGetNextState from './get-get-next-state'
import replay from './replay'

const minWidth = 4

export default (rotationSystem, placeFirstPiece, bar, wellDepth, wellWidth, enemyAi, replayTimeout, gameIsOver) => {
  if (rotationSystem.length < 1) {
    throw Error('Have to have at least one piece!')
  }
  if (wellDepth < bar) {
    throw Error("Can't have well with depth " + String(wellDepth) + ' less than bar at ' + String(bar))
  }
  if (wellWidth < minWidth) {
    throw Error("Can't have well with width " + String(wellWidth) + ' less than ' + String(minWidth))
  }

  const firstState = getFirstState(wellDepth, placeFirstPiece, enemyAi)
  const getNextState = getGetNextState(rotationSystem, bar, wellDepth, wellWidth)

  const draw = model => {
    if (model.wellStateId !== -1) {
      const wellState = model.wellStates[model.wellStateId]
      const well = wellState.well
      const piece = wellState.piece

      // Draw the well, and the current live piece in the well if any
      for (let y = 0; y < wellDepth; y++) {
        for (let x = 0; x < wellWidth; x++) {
          const td = document.querySelector('.hatetris__welltbody').rows[y].cells[x]
          if (well[y] & (1 << x)) {
            td.classList.add('hatetris__cell--landed')
          } else {
            td.classList.remove('hatetris__cell--landed')
          }

          if (piece === null) {
            td.classList.remove('hatetris__cell--live')
          } else {
            const orientation = piece === null ? null : rotationSystem[piece.id][piece.o]
            const y2 = y - piece.y - orientation.yMin
            const x2 = x - piece.x - orientation.xMin
            if (
              y2 >= 0 && y2 < orientation.yDim &&
              x2 >= 0 && x2 < orientation.xDim &&
              (orientation.rows[y2] & (1 << x2))
            ) {
              td.classList.add('hatetris__cell--live')
            } else {
              td.classList.remove('hatetris__cell--live')
            }
          }
        }
      }

      // Set the score
      document.querySelector('.hatetris__score').innerHTML = String(wellState.score)
    }

    // Spit out a replay, if there is one
    const elem = document.querySelector('.hatetris__replay-out')
    while (elem.hasChildNodes()) {
      elem.removeChild(elem.firstChild)
    }
    if (model.mode === 'GAME_OVER') {
      elem.appendChild(document.createTextNode('replay of last game: ' + replay.encode(model.replay)))
    }
  }

  // Accepts the input of a move and attempts to apply that
  // transform to the live piece in the live well.
  // Returns the new model.
  const handleMove = (model, move) => {
    const lastWellStateId = model.wellStateId

    const nextWellStateId = lastWellStateId + 1

    let nextReplay = model.replay
    let nextWellStates = model.wellStates

    if (!(lastWellStateId in model.replay) || move !== model.replay[lastWellStateId]) {
      // Push the new move
      nextReplay = nextReplay.slice().concat([move])

      // And truncate the future
      nextWellStates = nextWellStates.slice(0, nextWellStateId)
    }

    if (!(nextWellStateId in model.wellStates)) {
      const nextWellState = getNextState(model.wellStates[lastWellStateId], move)
      nextWellStates = nextWellStates.slice().concat([nextWellState])
    }

    const nextWellState = nextWellStates[nextWellStateId]

    const nextMode = gameIsOver(nextWellState) ? 'GAME_OVER' : model.mode

    // no live piece? make a new one
    // suited to the new world, of course
    if (nextWellState.piece === null && nextMode !== 'GAME_OVER') {
      nextWellState.piece = placeFirstPiece(enemyAi(nextWellState.well))
    }
      
    return {
      mode: nextMode,
      wellStateId: nextWellStateId,
      wellStates: nextWellStates,
      replay: nextReplay,
      replayTimeoutId: undefined
    }
  }

  let model = {
    mode: 'GAME_OVER',
    wellStateId: -1,
    wellStates: [],
    replay: [],
    replayTimeoutId: undefined
  }

  const handleEvent = event => {
    if (event === 'inputReplayStep') {
      if (model.mode === 'REPLAYING') {
        // if there is still replay left, time in another step from the replay
        // otherwise, allow the user to continue the game
        if (model.wellStateId in model.replay) {
          model = handleMove(model, model.replay[model.wellStateId])

          if (model.mode !== 'GAME_OVER') {
            model.replayTimeoutId = setTimeout(() => {
              model.replayTimeoutId = undefined
              handleEvent('inputReplayStep')
            }, replayTimeout)
          }
        } else {
          model.mode = 'PLAYING'
        }
      } else {
        // Ignore the call to inputReplayStep in "GAME_OVER"
        // or "PLAYING" modes.
        console.warn('Ignoring event', event, 'because mode is', model.mode)
      }
    } else if (event === 'startGame') {
      // there may be a replay in progress, this
      // must be killed
      if (model.replayTimeoutId) {
        clearTimeout(model.replayTimeoutId)
        model.replayTimeoutId = undefined
      }

      // clear the field and get ready for a new game
      model = {
        mode: 'PLAYING',
        wellStateId: 0,
        wellStates: [firstState],
        replay: [],
        replayTimeoutId: undefined
      }
    } else if (event === 'startReplay') {
      // there may be a replay in progress, this
      // must be killed
      if (model.replayTimeoutId) {
        clearTimeout(model.replayTimeoutId)
        model.replayTimeoutId = undefined
      }

      // user inputs replay string
      const string = window.prompt() || '' // change for IE

      // GO
      model = {
        mode: 'REPLAYING',
        wellStateId: 0,
        wellStates: [firstState],
        replay: replay.decode(string),

        // line up first step (will trigger own later steps)
        replayTimeoutId: setTimeout(() => {
          model.replayTimeoutId = undefined
          handleEvent('inputReplayStep')
        }, 0)
      }
    } else if (
      // Key moves
      event === 'L' ||
      event === 'R' ||
      event === 'D' ||
      event === 'U'
    ) {
      if (model.mode === 'PLAYING') {
        model = handleMove(model, event)
      } else {
        console.warn('Ignoring event', event, 'because mode is', model.mode)
      }
    } else if (event === 'clickL' || event === 'clickR' || event === 'clickD' || event === 'clickU') {
      if (model.mode === 'PLAYING') {
        model = handleMove(model, event.substring('click'.length))
      } else {
        console.warn('Ignoring event', event, 'because mode is', model.mode)
      }
    } else if (
      // Undo
      event === 'Z' ||
      event === 'clickZ'
    ) {
      // there may be a replay in progress, this
      // must be killed
      if (model.replayTimeoutId) {
        clearTimeout(model.replayTimeoutId)
        model.replayTimeoutId = undefined
      }

      const wellStateId = model.wellStateId - 1
      if (wellStateId in model.wellStates) {
        model = {
          mode: 'PLAYING',
          wellStateId: wellStateId,
          wellStates: model.wellStates, // Don't slice it off!
          replay: model.replay, // Don't slice it off!
          replayTimeoutId: undefined
        }
      } else {
        console.warn('Ignoring event', event, 'because start of history has been reached')
      }
    } else if (
      // Redo
      // TODO: merge this functionality with `inputReplayStep`,
      event === 'Y' ||
      event === 'clickY'
    ) {
      if (model.mode === 'PLAYING') {
        if (model.wellStateId in model.replay) {
          model = handleMove(model, model.replay[model.wellStateId])
        } else {
          console.warn('Ignoring event', event, 'because end of history has been reached')
        }
      } else {
        console.warn('Ignoring event', event, 'because mode is', model.mode)
      }
    } else {
      throw Error('Ignoring unrecognised event: ' + event)
    }

    draw(model)
  }

  const initialDraw = () => {
    const well = []
    for (let y = 0; y < wellDepth; y++) {
      const row = []
      for (let x = 0; x < wellWidth; x++) {
        row.push(undefined)
      }
      well.push(row)
    }

    ReactDOM.render(
      <table>
        <tbody className='hatetris__welltbody'>{
          well.map((row, y) =>
            <tr
              key={y}
            >{
              row.map((cell, x) => {
                const classNames = ['hatetris__cell']
                if (y === bar) {
                  classNames.push('hatetris__cell--bar')
                }

                const className = classNames.join(' ')

                return <td key={x} className={className}/>
              })
            }</tr>
          )
        }</tbody>
      </table>,
      document.querySelector('.hatetris__left')
    )

    // create playing field
    const tbody = document.querySelector('.hatetris__welltbody')

    // put some buttons on the playing field
    const buttons = [
      {y: 0, x: 0, event: 'clickZ', symbol: '\u21B6', title: 'Press Ctrl+Z to undo'},
      {y: 0, x: 1, event: 'clickU', symbol: '\u27F3', title: 'Press Up to rotate'},
      {y: 0, x: 2, event: 'clickY', symbol: '\u21B7', title: 'Press Ctrl+Y to redo'},
      {y: 1, x: 0, event: 'clickL', symbol: '\u2190', title: 'Press Left to move left'},
      {y: 1, x: 1, event: 'clickD', symbol: '\u2193', title: 'Press Down to move down'},
      {y: 1, x: 2, event: 'clickR', symbol: '\u2192', title: 'Press Right to move right'}
    ]
    buttons.forEach(button => {
      const td = tbody.rows[button.y].cells[button.x]
      td.appendChild(document.createTextNode(button.symbol))
      td.title = button.title
      td.addEventListener('click', () => {
        handleEvent(button.event)
      })
      td.classList.add('hatetris__cell--manual')
    })
    document.querySelector('.hatetris__start').addEventListener('click', () => {
      handleEvent('startGame')
    })
    document.querySelector('.hatetris__replay').addEventListener('click', () => {
      handleEvent('startReplay')
    })

    document.onkeydown = event => {
      event = event || window.event // add for IE

      if (event.keyCode === 37) {
        handleEvent('L')
      } else if (event.keyCode === 39) {
        handleEvent('R')
      } else if (event.keyCode === 40) {
        handleEvent('D')
      } else if (event.keyCode === 38) {
        handleEvent('U')
      } else if (event.keyCode === 90 && event.ctrlKey === true) {
        handleEvent('Z')
      } else if (event.keyCode === 89 && event.ctrlKey === true) {
        handleEvent('Y')
      }
    }

    draw(model)
  }

  initialDraw()
}
