/**
  HATETRIS
*/

'use strict'

import React from 'react'
import ReactDOM from 'react-dom'

import '../css/reset.css'
import '../css/hatetris.css'

import '../img/favicon.ico'

import '../html/hatetris.html'

import './statcounter'
import Game from './game.jsx'
import getEnemyAi from './enemy-ais/get-hatetris'
import getGameIsOver from './game-over-conditions/get-hatetris'
import rotationSystem from './rotation-systems/hatetris'

// Fixed attributes of all of Tetris
const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4

const gameIsOver = getGameIsOver(bar)
const enemyAi = getEnemyAi(rotationSystem, bar, wellDepth, wellWidth)
const replayTimeout = 50 // milliseconds per frame

ReactDOM.render(
  (
    <Game
      bar={bar}
      enemyAi={enemyAi}
      gameIsOver={gameIsOver}
      replayTimeout={replayTimeout}
      rotationSystem={rotationSystem}
      wellDepth={wellDepth}
      wellWidth={wellWidth}
    />
  ),
  document.querySelector('.index__root')
)
