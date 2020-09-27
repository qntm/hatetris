/**
  HATETRIS
*/

'use strict'

import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import Game from './components/Game/Game.jsx'
import { Hatetris0 } from './enemy-ais/hatetris-ai'
import hatetrisRotationSystem from './rotation-systems/hatetris-rotation-system'

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
