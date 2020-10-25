/**
  HATETRIS
*/

'use strict'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import './index.css'
import Game from './components/Game/Game.tsx'
import { Hatetris0 } from './enemy-ais/hatetris-ai.ts'
import hatetrisRotationSystem from './rotation-systems/hatetris-rotation-system.ts'

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
