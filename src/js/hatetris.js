/**
  HATETRIS
*/

'use strict'

import '../css/reset.css'
import '../css/hatetris.css'

import '../img/favicon.ico'

import '../html/hatetris.html'

import './statcounter'
import build from './build'
import getEnemyAi from './enemy-ais/get-hatetris'
import getGameIsOver from './game-over-conditions/get-hatetris'
import rotationSystem from './rotation-systems/hatetris'

// Fixed attributes of all of Tetris
const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4

const enemyAi = getEnemyAi(rotationSystem, bar, wellDepth, wellWidth)
const gameIsOver = getGameIsOver(bar)
const replayTimeout = 50 // milliseconds per frame

build(rotationSystem, bar, wellDepth, wellWidth, enemyAi, replayTimeout, gameIsOver)
