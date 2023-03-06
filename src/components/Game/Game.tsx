/**
  HATETRIS instance builder
*/

import * as React from 'react'

import { hatetrisAi } from '../../enemy-ais/hatetris-ai.ts'
import { hatetrisMildAi } from '../../enemy-ais/hatetris-mild.ts'
import { lovetrisAi } from '../../enemy-ais/lovetris-ai.ts'
import { brzAi } from '../../enemy-ais/brzustowski.ts'
import { burgAi } from '../../enemy-ais/burgiel.ts'
import hatetrisReplayCodec from '../../replay-codecs/hatetris-replay-codec.ts'
import { Well } from '../Well/Well.tsx'
import { getLogic } from './logic.ts'
import type {
  CoreState,
  Enemy,
  EnemyAi,
  GameProps,
  GameState,
  Piece,
  RotationSystem,
  WellState
} from './logic.ts'

const minWidth = 4

export type { CoreState, WellState, GameProps, RotationSystem, EnemyAi, Piece }

export const hatetris: Enemy = {
  shortDescription: 'HATETRIS',
  buttonDescription: 'HATETRIS, the original and worst',
  ai: hatetrisAi
}

export const hatetrisMild: Enemy = {
  shortDescription: (
    <a
      href='https://github.com/qntm/hatetris#hatetris-mild'
    >
      HATETRIS Mild
    </a>
  ),
  buttonDescription: 'HATETRIS without loop-prevention',
  ai: hatetrisMildAi
}

export const lovetris: Enemy = {
  shortDescription: '❤️',
  buttonDescription: 'all 4x1 pieces, all the time',
  ai: lovetrisAi
}

export const brz: Enemy = {
  shortDescription: (
    <a
      href='https://open.library.ubc.ca/media/download/pdf/831/1.0079748/1'
    >
      Brzustowski
    </a>
  ),
  buttonDescription: 'Brzustowski (1992)',
  ai: brzAi
}

const burg: Enemy = {
  shortDescription: (
    <a
      href='https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.55.8562&rep=rep1&type=pdf'
    >
      Burgiel
    </a>
  ),
  buttonDescription: 'Burgiel (1997)',
  ai: burgAi
}

const enemies = [hatetris, hatetrisMild, lovetris, brz, burg]

class Game extends React.Component<GameProps, GameState> {
  constructor (props: GameProps) {
    super(props)

    const {
      rotationSystem,
      bar,
      wellDepth,
      wellWidth
    } = this.props

    let error

    if (Object.keys(rotationSystem.rotations).length < 1) {
      error = Error('Have to have at least one piece!')
    }

    if (wellDepth < bar) {
      error = Error("Can't have well with depth " + String(wellDepth) + ' less than bar at ' + String(bar))
    }

    if (wellWidth < minWidth) {
      error = Error("Can't have well with width " + String(wellWidth) + ' less than ' + String(minWidth))
    }

    this.state = {
      error: error
        ? {
            interpretation: 'Caught this exception while trying to start HATETRIS. Application halted.',
            real: error.message,
            dismissable: false
          }
        : null,
      displayEnemy: false, // don't show it unless the user selects one manually
      enemy: hatetris,
      customAiCode: '',
      mode: 'INITIAL',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayCopiedTimeoutId: undefined,
      replayTimeoutId: undefined
    }
  }

  logic = getLogic(this.props)

  async getFirstWellState () {
    return await this.logic.getFirstWellState(this.state)
  }

  async handleMove (move: string) {
    this.setState(await this.logic.handleMove(this.state, move))
  }

  handleClickStart = async () => {
    const {
      replayCopiedTimeoutId,
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)
    clearTimeout(replayCopiedTimeoutId)

    let firstWellState: WellState
    try {
      firstWellState = await this.getFirstWellState()
    } catch (error) {
      console.error(error)
      this.setState({
        error: {
          interpretation: 'Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.',
          real: error.message,
          dismissable: true
        }
      })
      return
    }

    // clear the field and get ready for a new game
    this.setState({
      mode: 'PLAYING',
      wellStateId: 0,
      wellStates: [firstWellState],
      replay: [],
      replayCopiedTimeoutId: undefined,
      replayTimeoutId: undefined
    })
  }

  handleClickSelectAi = () => {
    this.setState({
      mode: 'SELECT_AI'
    })
  }

  handleClickReplay = async () => {
    const {
      replayTimeout
    } = this.props

    let {
      replayTimeoutId
    } = this.state

    // there may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)

    // user inputs replay string
    const string = window.prompt('Paste replay string...')

    if (string === null) {
      return
    }

    const replay = hatetrisReplayCodec.decode(string)
    // TODO: what if the replay is bad?

    let firstWellState: WellState
    try {
      firstWellState = await this.getFirstWellState()
    } catch (error) {
      console.error(error)
      this.setState({
        error: {
          interpretation: 'Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.',
          real: error.message,
          dismissable: true
        }
      })
      return
    }

    const wellStateId = 0
    replayTimeoutId = wellStateId in replay
      ? setTimeout(this.handleReplayTimeout, replayTimeout)
      : undefined
    const mode = wellStateId in replay ? 'REPLAYING' : 'PLAYING'

    // GO.
    this.setState({
      mode,
      wellStateId,
      wellStates: [firstWellState],
      replay,
      replayTimeoutId
    })
  }

  handleReplayTimeout = async () => {
    const {
      replayTimeout
    } = this.props

    const {
      mode,
      replay,
      wellStateId
    } = this.state

    let nextReplayTimeoutId

    if (mode === 'REPLAYING') {
      await this.handleRedo()

      if (wellStateId + 1 in replay) {
        nextReplayTimeoutId = setTimeout(this.handleReplayTimeout, replayTimeout)
      }
    } else {
      console.warn('Ignoring input replay step because mode is', mode)
    }

    this.setState({
      replayTimeoutId: nextReplayTimeoutId
    })
  }

  handleLeft = async () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      await this.handleMove('L')
    } else {
      console.warn('Ignoring event L because mode is', mode)
    }
  }

  handleRight = async () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      await this.handleMove('R')
    } else {
      console.warn('Ignoring event R because mode is', mode)
    }
  }

  handleDown = async () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      await this.handleMove('D')
    } else {
      console.warn('Ignoring event D because mode is', mode)
    }
  }

  handleUp = async () => {
    const { mode } = this.state
    if (mode === 'PLAYING') {
      await this.handleMove('U')
    } else {
      console.warn('Ignoring event U because mode is', mode)
    }
  }

  handleUndo = () => {
    const {
      replayTimeoutId,
      wellStateId,
      wellStates
    } = this.state

    // There may be a replay in progress, this
    // must be killed
    clearTimeout(replayTimeoutId)
    this.setState({
      replayTimeoutId: undefined
    })

    const nextWellStateId = wellStateId - 1
    if (nextWellStateId in wellStates) {
      this.setState({
        mode: 'PLAYING',
        wellStateId: nextWellStateId
      })
    } else {
      console.warn('Ignoring undo event because start of history has been reached')
    }
  }

  handleRedo = async () => {
    const {
      mode,
      replay,
      wellStateId
    } = this.state

    if (mode === 'PLAYING' || mode === 'REPLAYING') {
      if (wellStateId in replay) {
        await this.handleMove(replay[wellStateId])
      } else {
        console.warn('Ignoring redo event because end of history has been reached')
      }
    } else {
      console.warn('Ignoring redo event because mode is', mode)
    }
  }

  handleDocumentKeyDown = async (event: KeyboardEvent) => {
    if (event.key === 'Left' || event.key === 'ArrowLeft') {
      await this.handleLeft()
    }

    if (event.key === 'Right' || event.key === 'ArrowRight') {
      await this.handleRight()
    }

    if (event.key === 'Down' || event.key === 'ArrowDown') {
      await this.handleDown()
    }

    if (event.key === 'Up' || event.key === 'ArrowUp') {
      await this.handleUp()
    }

    if (event.key === 'z' && event.ctrlKey === true) {
      this.handleUndo()
    }

    if (event.key === 'y' && event.ctrlKey === true) {
      await this.handleRedo()
    }
  }

  handleClickCopyReplay = () => {
    const {
      copyTimeout
    } = this.props

    const {
      replay
    } = this.state

    return navigator.clipboard.writeText(hatetrisReplayCodec.encode(replay))
      .then(() => {
        const replayCopiedTimeoutId = setTimeout(this.handleCopiedTimeout, copyTimeout)
        this.setState({
          replayCopiedTimeoutId
        })
      })
  }

  handleCopiedTimeout = () => {
    this.setState({
      replayCopiedTimeoutId: undefined
    })
  }

  handleClickDone = () => {
    this.setState({
      mode: 'INITIAL'
    })
  }

  handleClickEnemy = (enemy: Enemy) => {
    this.setState({
      displayEnemy: true,
      enemy,
      mode: 'INITIAL'
    })
  }

  handleClickCustomEnemy = () => {
    this.setState({
      mode: 'PASTE'
    })
  }

  handleCancelCustomEnemy = () => {
    this.setState({
      mode: 'SELECT_AI'
    })
  }

  handleCustomAiChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      customAiCode: event.target.value
    })
  }

  handleSubmitCustomEnemy = () => {
    const {
      customAiCode
    } = this.state

    let ai: EnemyAi
    try {
      // eslint-disable-next-line no-new-func
      ai = Function(`
        "use strict"
        return (${customAiCode})
      `)()
    } catch (error) {
      console.error(error)
      this.setState({
        error: {
          interpretation: 'Caught this exception while trying to evaluate your custom AI JavaScript.',
          real: error.message,
          dismissable: true
        }
      })
      return
    }

    this.handleClickEnemy({
      shortDescription: 'custom',
      buttonDescription: 'this is never actually used',
      ai
    })
  }

  handleClickDismissError = () => {
    this.setState({
      error: null
    })
  }

  render () {
    const {
      bar,
      rotationSystem,
      wellDepth,
      wellWidth
    } = this.props

    const {
      customAiCode,
      displayEnemy,
      enemy,
      error,
      mode,
      replay,
      replayCopiedTimeoutId,
      wellStateId,
      wellStates
    } = this.state

    const wellState = wellStateId === -1 ? null : wellStates[wellStateId]

    const score = wellState && wellState.core.score

    if (error !== null) {
      return (
        <div className='game'>
          <h2 style={{ fontWeight: 'bold', fontSize: '150%' }}>Error</h2>
          <p data-testid='error-real'>
            <code style={{ fontFamily: 'monospace' }}>{error.real}</code>
          </p>
          <p data-testid='error-interpretation'>
            {error.interpretation}
          </p>

          {error.dismissable && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>To fix this</h3>
              <p>
                Check your browser console for more information.
                Use this information to fix your AI code and submit it again.
                Or, use one of the preset AIs instead.
              </p>

              <p>
                <button
                  data-testid='dismiss-error'
                  className='game__button'
                  type='button'
                  onClick={this.handleClickDismissError}
                >
                  OK
                </button>
              </p>
            </>
          )}

          {!error.dismissable && (
            <>
              <h3 style={{ fontWeight: 'bold' }}>To fix this</h3>
              <p>Report this problem to qntm.</p>
            </>
          )}
        </div>
      )
    }

    return (
      <div className='game'>
        <div className='game__top'>
          <div className='game__topleft'>
            <Well
              bar={bar}
              rotationSystem={rotationSystem}
              wellDepth={wellDepth}
              wellWidth={wellWidth}
              wellState={wellState}
            />
          </div>
          <div className='game__topright'>
            <p className='game__paragraph'>
              you&apos;re playing <b>HATETRIS</b> by qntm
            </p>

            {displayEnemy && (
              <p
                data-testid='enemy-short'
                className='game__paragraph'
              >
                AI: {enemy.shortDescription}
              </p>
            )}

            {score !== null && (
              <p
                data-testid='score'
                className='game__paragraph'
              >
                score: {score}
              </p>
            )}

            <div className='game__spacer' />

            <p className='game__paragraph'>
              <a href='http://qntm.org/hatetris'>
                about
              </a>
            </p>

            <p className='game__paragraph'>
              <a href='https://github.com/qntm/hatetris'>
                source code
              </a>
            </p>

            <p className='game__paragraph'>
              replays encoded using <a href='https://github.com/qntm/base2048'>Base2048</a>
            </p>
          </div>
        </div>

        {mode === 'INITIAL' && (
          <div className='game__bottom'>
            <button
              data-testid='start-button'
              className='game__button'
              type='button'
              onClick={this.handleClickStart}
            >
              start new game
            </button>

            <div className='game__paragraph' style={{ display: 'flex', gap: '10px' }}>
              <button
                data-testid='replay-button'
                className='game__button'
                type='button'
                onClick={this.handleClickReplay}
              >
                show a replay
              </button>

              <button
                data-testid='select-ai'
                className='game__button'
                type='button'
                onClick={this.handleClickSelectAi}
              >
                select AI
              </button>
            </div>
          </div>
        )}

        {mode === 'SELECT_AI' && (
          <div className='game__bottom game__bottom--select-ai'>
            <p>
              Select AI:
            </p>
            {
              enemies.map(enemy => (
                <button
                  data-testid='enemy'
                  className='game__button'
                  key={enemy.buttonDescription}
                  type='button'
                  onClick={() => this.handleClickEnemy(enemy)}
                >
                  {enemy.buttonDescription}
                </button>
              ))
            }

            <button
              data-testid='custom-enemy'
              className='game__button'
              type='button'
              onClick={this.handleClickCustomEnemy}
            >
              use custom AI
            </button>
          </div>
        )}

        {mode === 'PASTE' && (
          <div className='game__bottom'>
            <p>Enter custom code:</p>
            <div>
              <textarea
                autoFocus
                style={{ width: '100%' }}
                onChange={this.handleCustomAiChange}
                data-testid='ai-textarea'
                defaultValue={customAiCode}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <p style={{ flex: '1 1 100%' }}>
                <a href="https://github.com/qntm/hatetris#writing-a-custom-ai">
                  how to write a custom AI
                </a>
              </p>
              <button
                data-testid='cancel-custom-enemy'
                className='game__button'
                type='button'
                onClick={this.handleCancelCustomEnemy}
              >
                cancel
              </button>
              <button
                data-testid='submit-custom-enemy'
                className='game__button'
                type='button'
                onClick={this.handleSubmitCustomEnemy}
              >
                go
              </button>
            </div>
          </div>
        )}

        {mode === 'PLAYING' && (
          <div className='game__bottom'>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className='game__button'
                disabled={!(wellStateId - 1 in wellStates)}
                type='button'
                onClick={this.handleUndo}
                title='Press Ctrl+Z to undo'
              >
                ↶
              </button>
              <button
                className='game__button'
                type='button'
                onClick={this.handleUp}
                title='Press Up to rotate'
              >
                ⟳
              </button>
              <button
                className='game__button'
                disabled={!(wellStateId + 1 in wellStates)}
                type='button'
                onClick={this.handleRedo}
                title='Press Ctrl+Y to redo'
              >
                ↷
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className='game__button'
                type='button'
                onClick={this.handleLeft}
                title='Press Left to move left'
              >
                ←
              </button>
              <button
                data-testid='down'
                className='game__button'
                type='button'
                onClick={this.handleDown}
                title='Press Down to move down'
              >
                ↓
              </button>
              <button
                className='game__button'
                type='button'
                onClick={this.handleRight}
                title='Press Right to move right'
              >
                →
              </button>
            </div>
          </div>
        )}

        {mode === 'REPLAYING' && (
          <div
            data-testid='bottom'
            className='game__bottom'
          >
            replaying...
          </div>
        )}

        {mode === 'GAME_OVER' && (
          <div
            data-testid='bottom'
            className='game__bottom'
          >
            <div>
              replay of last game:
            </div>
            <div
              data-testid='replay-out'
              className='game__replay-out'
            >
              {hatetrisReplayCodec.encode(replay)}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className='game__button'
                type='button'
                onClick={this.handleUndo}
              >
                undo last move
              </button>

              <button
                data-testid='copy-replay'
                className='game__button'
                type='button'
                onClick={this.handleClickCopyReplay}
              >
                {replayCopiedTimeoutId ? 'copied!' : 'copy replay'}
              </button>

              <button
                data-testid='done'
                className='game__button'
                type='button'
                onClick={this.handleClickDone}
              >
                done
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
  }

  componentWillUnmount () {
    const {
      replayCopiedTimeoutId,
      replayTimeoutId
    } = this.state

    clearTimeout(replayCopiedTimeoutId)
    clearTimeout(replayTimeoutId)

    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }
}

export default Game
