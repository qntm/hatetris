/* eslint-env jest */

'use strict'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import * as React from 'react'

import Game from './Game'
import type { GameProps } from './Game'
import hatetrisRotationSystem from '../../rotation-systems/hatetris-rotation-system'

jest.useFakeTimers()

// BOY do I need to figure out a faster way to run these unit tests
jest.setTimeout(60000)

const replayTimeout = 2

describe('<Game>', () => {
  const renderGame = (props: Partial<GameProps> = {}) => {
    render(
      <Game
        bar={4}
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
    // RTL's keyboard activity simulation involves asynchronous delays.
    // We need to advance time so that those delayed things actually happen
    user = userEvent.setup({
      advanceTimers: number => {
        jest.advanceTimersByTime(number)
      }
    })
  })

  it('rejects a rotation system with no pieces', () => {
    renderGame({
      rotationSystem: {
        placeNewPiece: () => ({ id: '', o: NaN, x: NaN, y: NaN }),
        rotations: {}
      }
    })
    expect(screen.getByTestId('error-real')).toHaveTextContent('Have to have at least one piece!')
    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to start HATETRIS. Application halted.')
  })

  it('rejects a well depth below the bar', () => {
    renderGame({ bar: 4, wellDepth: 3 })
    expect(screen.getByTestId('error-real')).toHaveTextContent('Can\'t have well with depth 3 less than bar at 4')
    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to start HATETRIS. Application halted.')
  })

  it('rejects a well width less than 4', () => {
    renderGame({ wellWidth: 3 })
    expect(screen.getByTestId('error-real')).toHaveTextContent('Can\'t have well with width 3 less than 4')
    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to start HATETRIS. Application halted.')
  })

  it('ignores all keystrokes before the game has begun', async () => {
    const originalWarn = console.warn
    console.warn = jest.fn()

    renderGame()
    expect(screen.getByTestId('start-button')).toHaveTextContent('start new game')

    await user.keyboard('{Left}')
    await user.keyboard('{Right}')
    await user.keyboard('{Down}')
    await user.keyboard('{Up}')
    await user.keyboard('{Control>}z{/Control}')
    await user.keyboard('{Control>}y{/Control}')

    expect(console.warn).toHaveBeenCalledTimes(6)
    expect(screen.getByTestId('start-button')).toHaveTextContent('start new game')

    console.warn = originalWarn
  })

  it('lets you play a few moves', async () => {
    const originalWarn = console.warn
    console.warn = jest.fn()

    renderGame()

    await user.click(screen.getByTestId('start-button'))
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(4)

    await user.keyboard('{Left}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(4)

    await user.keyboard('{Right}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(4)

    await user.keyboard('{Down}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(4)

    // Rotate, puts part of the piece in contact with the bar below
    await user.keyboard('{Up}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(3)
    expect(screen.queryAllByTestId('well__cell well__cell--bar well__cell--live')).toHaveLength(1)

    // Undo
    await user.keyboard('{Control>}z{/Control}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(4)

    // Redo
    await user.keyboard('{Control>}y{/Control}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(3)
    expect(screen.queryAllByTestId('well__cell well__cell--bar well__cell--live')).toHaveLength(1)

    // Warn on attempted redo at end of history
    await user.keyboard('{Control>}y{/Control}')
    expect(screen.queryAllByTestId('well__cell well__cell--live')).toHaveLength(3)
    expect(screen.queryAllByTestId('well__cell well__cell--bar well__cell--live')).toHaveLength(1)
    expect(console.warn).toHaveBeenCalledTimes(1)

    console.warn = originalWarn
  })

  it('just lets you play if you enter an empty replay', async () => {
    renderGame()

    const prompt = jest.spyOn(window, 'prompt')
    prompt.mockReturnValueOnce('')
    await user.click(screen.getByTestId('replay-button'))
    expect(prompt.mock.calls).toEqual([
      ['Paste replay string...']
    ])
    prompt.mockRestore()

    expect(screen.queryAllByTestId('down')).toHaveLength(1)
  })

  it('lets you select a different AI and play a full game with it and provides a replay which you can copy', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.queryAllByTestId('enemy').at(1))
    await user.click(screen.getByTestId('start-button'))
    expect(screen.getByTestId('enemy-short')).toHaveTextContent('AI: ❤️')

    for (let i = 0; i < 187; i++) {
      await user.keyboard('{Down}')
    }

    expect(screen.getByTestId('replay-out')).toHaveTextContent('௨ටໃݹ௨ටໃݹ௨ටໃݹ௨ටໃݹ௨Đ')

    // Copy the replay
    await user.click(screen.getByTestId('copy-replay'))
    const contents = await navigator.clipboard.readText()
    expect(contents).toBe('௨ටໃݹ௨ටໃݹ௨ටໃݹ௨ටໃݹ௨Đ')

    // "copied!" disappears after a while
    expect(screen.getByTestId('copy-replay')).toHaveTextContent('copied!')

    jest.runAllTimers()

    expect(screen.getByTestId('copy-replay')).toHaveTextContent('copy replay')

    await user.click(screen.getByTestId('done'))
 })

  it('lets you use a custom AI', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() => \'J\'')
    await user.click(screen.getByTestId('submit-custom-enemy'))
    await user.click(screen.getByTestId('start-button'))

    expect(screen.getByTestId('enemy-short')).toHaveTextContent('AI: custom')

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

    expect(screen.queryAllByTestId('enemy')).toHaveLength(4)
  })

  it('errors out if your custom AI is invalid JavaScript, but you can dismiss it', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() =>')

    const error = console.error
    console.error = jest.fn()
    await user.click(screen.getByTestId('submit-custom-enemy'))
    console.error = error

    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to evaluate your custom AI JavaScript.')

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
    const error = console.error
    console.error = jest.fn()
    const prompt = jest.spyOn(window, 'prompt')
    prompt.mockReturnValueOnce('')
    await user.click(screen.getByTestId('replay-button'))
    expect(prompt.mock.calls).toEqual([
      ['Paste replay string...']
    ])
    prompt.mockRestore()
    console.error = error

    expect(screen.getByTestId('error-real')).toHaveTextContent('BANG')
    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.')
  })

  it('errors out if your custom AI returns a bad piece', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.getByTestId('custom-enemy'))
    await user.type(screen.getByTestId('ai-textarea'), '() => \'K\'')
    await user.click(screen.getByTestId('submit-custom-enemy'))

    const error = console.error
    console.error = jest.fn()
    await user.click(screen.getByTestId('start-button'))
    console.error = error

    expect(screen.getByTestId('error-real')).toHaveTextContent('Bad piece ID: K')
    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to generate the first piece using your custom enemy AI. Game abandoned.')
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

    const error = console.error
    console.error = jest.fn()
    await user.click(screen.getByTestId('down'))
    console.error = error

    expect(screen.getByTestId('error-real')).toHaveTextContent('FZAAPP')
    expect(screen.getByTestId('error-interpretation')).toHaveTextContent('Caught this exception while trying to generate a new piece using your custom AI. Game halted.')
  })

  it('lets you decide not to replay anything', async () => {
    renderGame()

    const prompt = jest.spyOn(window, 'prompt')
    prompt.mockReturnValueOnce(null)
    await user.click(screen.getByTestId('replay-button'))
    expect(prompt.mock.calls).toEqual([
      ['Paste replay string...']
    ])
    prompt.mockRestore()
  })

  it('lets you replay a too-long replay', async () => {
    const originalWarn = console.warn
    console.warn = jest.fn()

    renderGame()

    // Replay keeps pressing Down after game over
    const prompt = jest.spyOn(window, 'prompt')
    prompt.mockReturnValueOnce('AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA')
    await user.click(screen.getByTestId('replay-button'))
    expect(prompt.mock.calls).toEqual([
      ['Paste replay string...']
    ])
    prompt.mockRestore()

    // Play beyond the end of the supplied replay
    jest.advanceTimersByTime(replayTimeout * 150)

    expect(console.warn.mock.calls).toEqual([
      ['Ignoring input replay step because mode is', 'GAME_OVER']
    ])

    console.warn = originalWarn
  })

  it('lets you undo and stops replaying when a replay is in progress', async () => {
    renderGame()

    // Replay is an incomplete game
    const prompt = jest.spyOn(window, 'prompt')
    prompt.mockReturnValueOnce('AAAA AAAA AAAA')
    await user.click(screen.getByTestId('replay-button'))
    expect(prompt.mock.calls).toEqual([
      ['Paste replay string...']
    ])
    prompt.mockRestore()

    // Play beyond the end of the supplied replay
    jest.advanceTimersByTime(replayTimeout * 30)

    await user.keyboard('{Control>}z{/Control}')
    // TODO: assert that `wellStateId` is now decremented?
  })
})
