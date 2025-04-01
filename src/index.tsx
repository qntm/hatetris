/**
  HATETRIS
*/

import './index.css'
import './components/Game/Game.css'
import './components/Well/Well.css'

import * as React from 'react'
import { createRoot } from 'react-dom/client'

import Game from './components/Game/Game.jsx'
import hatetrisRotationSystem from './rotation-systems/hatetris-rotation-system.js'

const root = createRoot(document.querySelector('.index__root'))
root.render(
  <Game
    bar={4}
    copyTimeout={3000}
    replayTimeout={50}
    rotationSystem={hatetrisRotationSystem}
    wellDepth={20}
    wellWidth={10}
  />
)
