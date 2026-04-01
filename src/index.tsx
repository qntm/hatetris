/**
  HATETRIS
*/

import './index.css'
import './components/Game/Game.css'
import './components/Well/Well.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import Game from './components/Game/Game.tsx'
import hatetrisRotationSystem from './rotation-systems/hatetris-rotation-system.ts'

declare global {
  interface Window {
    __HATETRIS_ENV__: string
  }
}

if (window.__HATETRIS_ENV__ === 'development') {
  new EventSource('/esbuild').addEventListener('change', () => location.reload())
}

const rootElement = document.querySelector('.index__root')
if (rootElement === null) {
  throw Error('Failed to find root element')
}

const root = ReactDOM.createRoot(rootElement)
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
