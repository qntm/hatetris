/**
  HATETRIS
*/

import './index.css'
import './components/Game/Game.css'
import './components/Well/Well.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Game from './components/Game/Game.jsx'
import hatetrisRotationSystem from './rotation-systems/hatetris-rotation-system.js'

ReactDOM.render(
  (
    <Game
      bar={4}
      copyTimeout={3000}
      replayTimeout={50}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={20}
      wellWidth={10}
    />
  ),
  document.querySelector('.index__root')
)
