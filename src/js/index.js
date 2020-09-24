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
import HatetrisAi from './hatetris-ai'
import hatetrisRotationSystem from './hatetris-rotation-system'

// Fixed attributes of all of Tetris
const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4
const replayTimeout = 50 // milliseconds per frame

ReactDOM.render(
  (
    <Game
      bar={bar}
      EnemyAi={HatetrisAi}
      replayTimeout={replayTimeout}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={wellDepth}
      wellWidth={wellWidth}
    />
  ),
  document.querySelector('.index__root')
)
