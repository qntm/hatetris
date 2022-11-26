/**
  HATETRIS
*/

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import './index.css'
import Game from './components/Game/Game'
import hatetrisRotationSystem from './rotation-systems/hatetris-rotation-system'

ReactDOM.render(
  (
    <Game
      bar={4}
      replayTimeout={50}
      rotationSystem={hatetrisRotationSystem}
      wellDepth={20}
      wellWidth={10}
    />
  ),
  document.querySelector('.index__root')
)
