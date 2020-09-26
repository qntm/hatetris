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
import { Hatetris0 } from './hatetris-ai'
import hatetrisRotationSystem from './hatetris-rotation-system'

ReactDOM.render(
  (
    <Game
      bar={4}
      EnemyAi={Hatetris0}
      replayTimeout={50}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={20}
      wellWidth={10}
    />
  ),
  document.querySelector('.index__root')
)
