import * as assert from 'node:assert'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { describe, it, beforeEach } from 'mocha'
import * as React from 'react'
import * as sinon from 'sinon'
import Game from '../../../src/components/Game/Game.jsx'
import type { GameProps } from '../../../src/components/Game/Game.jsx'
import hatetrisRotationSystem from '../../../src/rotation-systems/hatetris-rotation-system.js'

// It looks like Testing Library React doesn't play well with Sinon's fake timers,
// so just do all of our testing in real time!
const replayTimeout = 0
const copyTimeout = 100

describe('<Game>', function () {
  this.timeout(5000)

  const renderGame = (props: Partial<GameProps> = {}) => {
    render(
      <Game
        bar={4}
        copyTimeout={copyTimeout}
        replayTimeout={replayTimeout}
        rotationSystem={hatetrisRotationSystem}
        wellDepth={20}
        wellWidth={10}
        {...props}
      />
    )
  }

  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('rejects a rotation system with no pieces', () => {
    renderGame({
      rotationSystem: {
        placeNewPiece: () => ({ id: '', o: NaN, x: NaN, y: NaN }),
        rotations: {}
      }
    })
    assert.strictEqual(screen.getByTestId('error-real').textContent, 'Have to have at least one piece!')
    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to start HATETRIS. Application halted.')
  })

  it('rejects a well depth below the bar', () => {
    renderGame({ bar: 4, wellDepth: 3 })
    assert.strictEqual(screen.getByTestId('error-real').textContent, 'Can\'t have well with depth 3 less than bar at 4')
    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to start HATETRIS. Application halted.')
  })

  it('rejects a well width less than 4', () => {
    renderGame({ wellWidth: 3 })
    assert.strictEqual(screen.getByTestId('error-real').textContent, 'Can\'t have well with width 3 less than 4')
    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to start HATETRIS. Application halted.')
  })

  it('ignores all keystrokes before the game has begun', async () => {
    const warn = sinon.stub(console, 'warn')
    renderGame()
    assert.strictEqual(screen.getByTestId('start-button').textContent, 'start new game')

    await user.keyboard('{Left}')
    await user.keyboard('{Right}')
    await user.keyboard('{Down}')
    await user.keyboard('{Up}')
    await user.keyboard('{Control>}z{/Control}')
    await user.keyboard('{Control>}y{/Control}')

    assert.strictEqual(warn.getCalls().length, 6)
    assert.strictEqual(screen.getByTestId('start-button').textContent, 'start new game')

    warn.restore()
  })

  it('lets you play a few moves', async () => {
    const warn = sinon.stub(console, 'warn')

    renderGame()

    await user.click(screen.getByTestId('start-button'))
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 4)

    await user.keyboard('{Left}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 4)

    await user.keyboard('{Right}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 4)

    await user.keyboard('{Down}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 4)

    // Rotate, puts part of the piece in contact with the bar below
    await user.keyboard('{Up}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 3)
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--bar well__cell--live').length, 1)

    // Undo
    await user.keyboard('{Control>}z{/Control}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 4)

    // Redo
    await user.keyboard('{Control>}y{/Control}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 3)
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--bar well__cell--live').length, 1)

    // Warn on attempted redo at end of history
    await user.keyboard('{Control>}y{/Control}')
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--live').length, 3)
    assert.strictEqual(screen.queryAllByTestId('well__cell well__cell--bar well__cell--live').length, 1)
    assert.strictEqual(warn.getCalls().length, 1)

    warn.restore()
  })

  it('just lets you play if you enter an empty replay', async () => {
    renderGame()

    const prompt = sinon.stub(window, 'prompt')
    prompt.returns('')
    await user.click(screen.getByTestId('replay-button'))
    assert.deepStrictEqual(prompt.getCalls().map(call => call.args), [
      ['Paste replay string...']
    ])
    prompt.restore()

    assert.strictEqual(screen.queryAllByTestId('down').length, 1)
  })

  it('lets you select a different AI and play a full game with it and provides a replay which you can copy', async function () {
    this.timeout(10000)
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.queryAllByTestId('enemy').at(2))
    await user.click(screen.getByTestId('start-button'))
    assert.strictEqual(screen.getByTestId('enemy-short').textContent, 'AI: ❤️')

    for (let i = 0; i < 187; i++) {
      await user.keyboard('{Down}')
    }

    assert.strictEqual(screen.getByTestId('replay-out').textContent, '௨ටໃݹ௨ටໃݹ௨ටໃݹ௨ටໃݹ௨Đ')

    // Copy the replay
    await user.click(screen.getByTestId('copy-replay'))
    const contents = await navigator.clipboard.readText()
    assert.strictEqual(contents, '௨ටໃݹ௨ටໃݹ௨ටໃݹ௨ටໃݹ௨Đ')

    // "copied!" disappears after a while
    assert.strictEqual(screen.getByTestId('copy-replay').textContent, 'copied!')

    await new Promise(resolve => {
      setTimeout(resolve, copyTimeout)
    })

    assert.strictEqual(screen.getByTestId('copy-replay').textContent, 'copy replay')

    await user.click(screen.getByTestId('done'))
  })

  it('lets you use a custom AI', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() => \'J\'')
    await user.click(screen.getByTestId('submit-custom-enemy'))
    await user.click(screen.getByTestId('start-button'))

    assert.strictEqual(screen.getByTestId('enemy-short').textContent, 'AI: custom')

    // current piece is a J... assertion TODO
  })

  it('supports a custom AI with state', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))

    // AI state is last piece sent
    // (_, aiState) => aiState === 'S' ? ['Z', 'Z'] : ['S', 'S']
    await user.type(screen.getByTestId('ai-textarea'), '(_, aiState) => aiState === \'S\' ? [[\'Z\', \'Z\'] : [[\'S\', \'S\']')
    await user.click(screen.getByTestId('submit-custom-enemy'))
    await user.click(screen.getByTestId('start-button'))

    // first piece is an S... assertion TODO
    // second piece is a Z... assertion TODO
  })

  it('lets you decide NOT to use a custom AI', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.click(screen.getByTestId('cancel-custom-enemy'))

    assert.strictEqual(screen.queryAllByTestId('enemy').length, 5)
  })

  it('errors out if your custom AI is invalid JavaScript, but you can dismiss it', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() =>')

    const error = sinon.stub(console, 'error')
    await user.click(screen.getByTestId('submit-custom-enemy'))
    error.restore()

    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to evaluate your custom AI JavaScript.')

    await user.click(screen.getByTestId('dismiss-error'))
  })

  it('errors out if your custom AI throws an error on the first piece', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() => {{ throw Error(\'BANG\') }')
    await user.click(screen.getByTestId('submit-custom-enemy'))

    // Start a replay instead of starting a new game (coverage)
    // TODO: deduplicate that code
    const error = sinon.stub(console, 'error')
    const prompt = sinon.stub(window, 'prompt')
    prompt.returns('')
    await user.click(screen.getByTestId('replay-button'))
    assert.deepStrictEqual(prompt.getCalls().map(call => call.args), [
      ['Paste replay string...']
    ])
    prompt.restore()
    error.restore()

    assert.strictEqual(screen.getByTestId('error-real').textContent, 'BANG')
    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.')
  })

  it('errors out if your custom AI returns a bad piece', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() => \'K\'')
    await user.click(screen.getByTestId('submit-custom-enemy'))

    const error = sinon.stub(console, 'error')
    await user.click(screen.getByTestId('start-button'))
    error.restore()

    assert.strictEqual(screen.getByTestId('error-real').textContent, 'Bad piece ID: K')
    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.')
  })

  it('errors out if your custom AI throws an error on a later piece', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), `
      (() => {{
        let first = true
        return () => {{
          if (first) {{
            first = false
            return 'I'
          }
          throw Error('FZAAPP')
        }
      })()
    `)
    await user.click(screen.getByTestId('submit-custom-enemy'))
    await user.click(screen.getByTestId('start-button'))

    for (let i = 0; i < 18; i++) {
      await user.click(screen.getByTestId('down'))
    }

    const error = sinon.stub(console, 'error')
    await user.click(screen.getByTestId('down'))
    error.restore()

    assert.strictEqual(screen.getByTestId('error-real').textContent, 'FZAAPP')
    assert.strictEqual(screen.getByTestId('error-interpretation').textContent, 'Caught this exception while trying to generate a new piece using your custom AI. Game halted.')
  })

  it('lets you decide not to replay anything', async () => {
    renderGame()

    const prompt = sinon.stub(window, 'prompt')
    prompt.returns(null)
    await user.click(screen.getByTestId('replay-button'))
    assert.deepStrictEqual(prompt.getCalls().map(call => call.args), [
      ['Paste replay string...']
    ])
    prompt.restore()
  })

  // The act of initiating a replay causes a timeout to be created which
  // will play one step of the replay. If we use Sinon to wait for that
  // timeout to trigger, then that'll play back one move... but it will
  // still leave various promises unresolved. `handleMove` won't return,
  // which means `handleRedo` won't return, which means the next replay
  // timeout won't be created. This means we can't just wait for any
  // amount of time... we need create another promise which will resolve
  // along with those other unresolved promises...
  const advanceReplaySteps = async (n: number) => {
    for (let i = 0; i < n; i++) {
      const promise = new Promise(resolve => {
        setTimeout(resolve, replayTimeout)
      })

      // ...then `await` THAT
      await promise
    }
  }

  it('lets you replay a too-long replay', async () => {
    const warn = sinon.stub(console, 'warn')

    renderGame()

    // Replay keeps pressing Down after game over
    const prompt = sinon.stub(window, 'prompt')
    prompt.returns('AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA')
    await user.click(screen.getByTestId('replay-button'))
    assert.deepStrictEqual(prompt.getCalls().map(call => call.args), [
      ['Paste replay string...']
    ])
    prompt.restore()

    // Play beyond the end of the supplied replay.
    await advanceReplaySteps(300)

    assert.deepStrictEqual(warn.getCalls().map(call => call.args), [
      ['Ignoring input replay step because mode is', 'GAME_OVER']
    ])

    warn.restore()
  })

  it('lets you undo and stops replaying when a replay is in progress', async () => {
    renderGame()

    // Replay is an incomplete game
    const prompt = sinon.stub(window, 'prompt')
    prompt.returns('AAAA AAAA AAAA')
    await user.click(screen.getByTestId('replay-button'))
    assert.deepStrictEqual(prompt.getCalls().map(call => call.args), [
      ['Paste replay string...']
    ])
    prompt.restore()

    // Play beyond the end of the supplied replay
    await advanceReplaySteps(60)

    await user.keyboard('{Control>}z{/Control}')
    // TODO: assert that `wellStateId` is now decremented?
  })
})
