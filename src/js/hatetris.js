/**
  HATETRIS
*/

'use strict'

import ReactDOM from 'react-dom'

import '../css/reset.css'
import '../css/hatetris.css'

import '../img/favicon.ico'

import '../html/hatetris.html'

import './statcounter'
import Game from './game.jsx'
import getEnemyAi from './enemy-ais/get-hatetris'
import getGameIsOver from './game-over-conditions/get-hatetris'
import getPlaceFirstPiece from './piece-placement/get-hatetris'
import rotationSystem from './rotation-systems/hatetris'

// Fixed attributes of all of Tetris
const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4

const placeFirstPiece = getPlaceFirstPiece(wellWidth)
const gameIsOver = getGameIsOver(bar)
const enemyAi = getEnemyAi(rotationSystem, placeFirstPiece, bar, wellDepth, wellWidth)
const replayTimeout = 50 // milliseconds per frame

ReactDOM.render(<Game
  bar={bar}
  enemyAi={enemyAi}
  gameIsOver={gameIsOver}
  placeFirstPiece={placeFirstPiece}
  replayTimeout={replayTimeout}
  rotationSystem={rotationSystem}
  wellDepth={wellDepth}
  wellWidth={wellWidth}
/>, document.body)
