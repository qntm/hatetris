/* eslint-env jest */

'use strict'

import { shallow } from 'enzyme'
import * as React from 'react'

import Game from './Game.tsx'
import type { GameProps } from './Game.tsx'
import { Hatetris0 } from '../../enemy-ais/hatetris-ai.ts'
import hatetrisRotationSystem from '../../rotation-systems/hatetris-rotation-system.ts'

jest.useFakeTimers()

describe('<Game>', () => {
  const getGame = (props: Partial<GameProps> = {}) => {
    return shallow<Game>(
      <Game
        bar={4}
        EnemyAi={Hatetris0}
        replayTimeout={0}
        rotationSystem={hatetrisRotationSystem}
        wellDepth={20}
        wellWidth={10}
        {...props}
      />
    )
  }

  const firstWellState = {
    piece: { id: 0, o: 0, x: 3, y: 0 },
    score: 0,
    well: Array(20).fill(0)
  }

  it('rejects a rotation system with no pieces', () => {
    expect(() => getGame({
      rotationSystem: {
        placeNewPiece: () => {},
        rotations: []
      }
    })).toThrowError()
  })

  it('rejects a well depth below the bar', () => {
    expect(() => getGame({ bar: 4, wellDepth: 3 })).toThrowError()
  })

  it('rejects a well width less than 4', () => {
    expect(() => getGame({ wellWidth: 3 })).toThrowError()
  })

  it('ignores all keystrokes before the game has begun', () => {
    const game = getGame()
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'GAME_OVER',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayTimeoutId: undefined
    })

    const warn = jest.spyOn(console, 'warn')
    warn.mockImplementation(() => {})
    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Left' }))
    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Right' }))
    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Down' }))
    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Up' }))
    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Z', ctrlKey: true }))
    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Y', ctrlKey: true }))
    expect(warn).toHaveBeenCalledTimes(6)
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'GAME_OVER',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayTimeoutId: undefined
    })

    warn.mockRestore()
    game.unmount()
  })

  it('lets you play a few moves', () => {
    const game = getGame()
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'GAME_OVER',
      wellStateId: -1,
      wellStates: [],
      replay: [],
      replayTimeoutId: undefined
    })

    game.find('.game__start-button').simulate('click')
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 0,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }],
      replay: [],
      replayTimeoutId: undefined
    })

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 1,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 2, y: 0 }
      }],
      replay: ['L'],
      replayTimeoutId: undefined
    })

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 2,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 2, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }],
      replay: ['L', 'R'],
      replayTimeoutId: undefined
    })

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 3,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 2, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 1 }
      }],
      replay: ['L', 'R', 'D'],
      replayTimeoutId: undefined
    })

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 4,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 2, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 1 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 1, x: 3, y: 1 }
      }],
      replay: ['L', 'R', 'D', 'U'],
      replayTimeoutId: undefined
    })

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Z', ctrlKey: true }))
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 3,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 2, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 1 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 1, x: 3, y: 1 }
      }],
      replay: ['L', 'R', 'D', 'U'],
      replayTimeoutId: undefined
    })

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Y', ctrlKey: true }))
    expect(game.state()).toEqual({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      wellStateId: 4,
      wellStates: [{
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 2, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 0 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 0, x: 3, y: 1 }
      }, {
        well: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        score: 0,
        piece: { id: 0, o: 1, x: 3, y: 1 }
      }],
      replay: ['L', 'R', 'D', 'U'],
      replayTimeoutId: undefined
    })

    // Warn on attempted redo at end of history
    const warn = jest.spyOn(console, 'warn')
    warn.mockImplementation(() => {})

    game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Y', ctrlKey: true }))
    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
    game.unmount()
  })

  it('just lets you play if you enter an empty replay', () => {
    const game = getGame()

    const prompt = jest.spyOn(window, 'prompt')
    prompt.mockReturnValueOnce('')
    game.find('.game__replay-button').simulate('click')
    prompt.mockRestore()

    expect(game.state()).toEqual(expect.objectContaining({
      enemyAi: expect.any(Function),
      firstWellState,
      mode: 'PLAYING',
      replay: [],
      replayTimeoutId: undefined,
      wellStates: [
        expect.anything()
      ],
      wellStateId: 0
    }))

    game.unmount()
  })

  describe('when a replay is in progress', () => {
    let game: ReturnType<typeof getGame>

    beforeEach(() => {
      game = getGame()

      const prompt = jest.spyOn(window, 'prompt')
      prompt.mockReturnValueOnce('AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA A2')
      game.find('.game__replay-button').simulate('click')
      prompt.mockRestore()

      // Play a little of the replay
      jest.runOnlyPendingTimers()
      jest.runOnlyPendingTimers()
      jest.runOnlyPendingTimers()

      expect(game.state()).toEqual(expect.objectContaining({
        enemyAi: expect.any(Function),
        firstWellState,
        mode: 'REPLAYING',
        wellStates: [
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything()
        ],
        wellStateId: 3,
        replayTimeoutId: expect.any(Number)
      }))
    })

    afterEach(() => {
      game.unmount()
    })

    it('lets you start a new game', () => {
      game.find('.game__start-button').simulate('click')
      expect(game.state()).toEqual(expect.objectContaining({
        enemyAi: expect.any(Function),
        firstWellState,
        mode: 'PLAYING',
        wellStates: [
          expect.anything()
        ],
        wellStateId: 0,
        replayTimeoutId: undefined // trashed
      }))
    })

    it('lets you start a new replay', () => {
      const prompt = jest.spyOn(window, 'prompt')
      prompt.mockReturnValueOnce('AAAA 1234 BCDE 2345 CDEF 3456')
      game.find('.game__replay-button').simulate('click')
      prompt.mockRestore()

      expect(game.state()).toEqual(expect.objectContaining({
        enemyAi: expect.any(Function),
        firstWellState,
        mode: 'REPLAYING',
        wellStates: [
          expect.anything()
        ],
        wellStateId: 0,
        replayTimeoutId: expect.any(Number)
      }))
    })

    it('lets you undo and stops replaying if you do so', () => {
      game.instance().handleDocumentKeyDown(new window.KeyboardEvent('keydown', { key: 'Z', ctrlKey: true }))
      expect(game.state()).toEqual(expect.objectContaining({
        enemyAi: expect.any(Function),
        firstWellState,
        mode: 'PLAYING', // no longer replaying
        wellStates: [
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything() // well state ID 3 still exists
        ],
        wellStateId: 2, // down from 3
        replayTimeoutId: undefined
      }))
    })
  })

  describe('check known replays', () => {
    const runs = [{
      name: 'qntm',
      expectedScore: 0,
      replays: {
        hex: 'AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA A2',
        Base65536: '𤆻𤆻𤆻𤆻𤆻𡚻',
        Base2048: '௨ටໃݹ௨ටໃݹठ'
      }
    }, {
      name: 'Atypical',
      expectedScore: 11,
      replays: {
        hex: '032A AAAA AAAA 8C00 AAAA AA8C AAAA AAAA AB00 AAAA AB22 AAAA AABA AAAA AAA8 0002 EAAA A8C0 AAAA B0AA AAAA B000 16AA AAA7 2AAA AAAA EAAA AAA7 6AAA AAAA AD6A AAAA AAD5 556A AAAA AA95 56AA AAAA AA6A AAAA AA55 6AAA AAAA 8AAA AAA9 4AAA AAAA 9556 AAAA AAA0 2AAA AAAA AA8A A6AA AAAA A556 AAAA AA00 02AA AAA0 00AA AAA2 AAAA 2AAA 82A6 AAAA A2AA 62AA A56A AAA2 D6AA AA95 76AA AA80 0AAA AAA8 02AA A802 AAA8 00AA ACAA AAEA AAD6 AAAA B556 AAAA 556A AAA6 AAAB D555 6AAA 8AAA A02A AAD5 AAAB 6AAB 555A AB56 AAE2 AA00 F7AA AC2A A83A A7AA B5AA C000 AAA5 A82A B000 A8',
        Base65536: '㼬𤆻攌𣺻㼌𤂻𤇃㲬𤄋𤆜𠦻𥄸䂹𣸫𤇁𤦸𤄥𤚤𤂻𤇋𤪄𤆻邌𣊻𤅷𓎻𤆻𤆄𓊺𤆻𤄋㾅𢶻𤅛𤆢𣚻𤆴𓊺𣺻𤄲傣㾹㾸𢪱𢚻綸𢰋𠚻邌𠊹𣽋𤄰炸𤆳𣼰𤇀𣋋𣽛胇𓊸𠪻𥶻𣙻悻ꊬ肬𓎜𤲸𤺸𠤋𥇔傜𥆑𣹌𤋅𣼲做促',
        Base2048: 'ϥقໂɝƐඖДݹஶʈງƷ௨ೲໃܤѢقҾחࢲටฅڗ௨ΡІݪ௨ళȣݹࢴටງ໒௨ஶໃܥ௨റІݮ௨ఴІݥذඡଈݹƍق๓অஒॴแђञඖЅи௨sǶɔۑడПݷޠقԩݹࠉൿຟɓతණງஈশ੬෪অࠑථධٽଫ൝ଆࡨশ૫СܭߜయլݚɶऋഭܭرɤธӃస൯'
      }
    }, {
      name: 'SDA (1)',
      expectedScore: 17,
      replays: {
        hex: '56AA AAAA AA9A AAAA AAAA 8AAA AAAA AA00 AAAA AAAA ACAA AA8A AAB2 AAAA AAA5 6AAA AAAA 9AAA AAAA AEAA AAAA 9F5A AAAA ABD6 AAAA AAD5 6AAA AAAB 00AA AAAA AEAA AAAA FD6A AAAA BD56 AAAA AF5A AAAA FEAA AAB5 5AAA ABC2 AAAA 9BF0 0AAA AAA6 BBF0 0AAA AAAB AC02 AAAA AAEA AAAB 6AAA AB55 AAAA B56A AAAB 5AAA AA80 AAAA AA82 AAAA AB2A AAAC 02AA AAAB F6AA AAFE AAA5 6AAA AF56 AAAD 56AA BF55 AABC 2AAA 6FC0 2AAA A6BB F00A AAAA EB00 AAAA AE5A AAEA AADA AAA0 2AAA A82A AAAC AAAC 02AA AAD5 5AAA B5C0 AAB5 6AA9 AAAF 6ABD 56AB F00A AA6B BF00 AAAB A5AA B00A AAB2 AA5A A96A B55A A80A AA80 2AAA C2AA B0AA C02A AC02 A9C2 A9E9 76A6 AAEA',
        Base65536: '𤅫肹𤂻𤄋点𣾻𤇀𤂀𤇀ꊺ𣪻𤆻𤇋𥮔𣺻𤇕𤶸𣾻𤇃𥆹𡒻𤅛𤇗邭𧆹𤶹𡎻𣼛𦥈𣪻𡒜𤄻𢊌𤄻𤆌肜𤶹𡊻𣽫𤇅𤆢傸𤚻𡊻𤄻𤇤𤂎𣹫𤃖𣿇𣻧𤃑𦥈𠪻𡒜𣼻𤧉𢊻𣾅𣋋𣡋𡞻𡊻𢈋𣸻胇醬𡈫𡩫𥪹𠆽𣿣𤹉𤃣郉炌㾬𣺅𤵛悸𤂣𣿁𤋁𡈻脻脛𤪕𣺤ᗊ',
        Base2048: 'ۑටժݹਐටดݹமsරݪƐජଈݲ௨ණໃφذගדݶಒටܨݹসටѧݹ൭ඤדݜ௧ซະਨதԀໃڻಜʈະसѻගІѠ௧ซະऄமϺเݹߤඨVܭѻඳІʅઅගتףயҔзݢऊටȝधѻೲܨݷಗචЄࡨଫඝܘɚமʈฅ๐ષ෦ฅ൩Ԥ๗ཚޡதԻѣݪॳ౾ແߢࡃశ༩ܣறඤÐњ௬ගƫঋ୦ԟȠॾಭ'
      }
    }, {
      name: 'SDA (2)',
      expectedScore: 20,
      replays: {
        hex: '56AA AAAA AAA6 AAAA AAAA 8AAA AAAA AB55 AAAA AAAB 00AA AAAA AA9A AAAA AAA6 0AAA AAAA A96A AAA8 AAA9 A808 AAAA AA9A AAAA AAAB 55AA AAAA A82A AAAA AA97 5AAA AA9A AAAA A6AB 5AA6 AAAA 6AAA AAAA C02A AAAA AABF BEAA AAA9 E9AA AAA9 AAAA AAFE AAAA AD5A AAAA F0AA AAA9 BF00 AAAA AA9B AD56 AAAA FC02 AAAA AABA C02A AAAA AB5A AAAA BAAA AAB6 AAAA AB55 6AAA A02A AAAA A82A AAAA ACAA AAAC 02AA AAAA FE9A AAAF EAAA 9D5A AAA9 6AAA AD57 AAAB C2AA A9BF 00AA AAA6 BBF0 0AAA AABA D56A AAC0 2AAA AAD6 AAAB AAAA DAAA A80A AAAA 82AA AAB5 5AAA B2AA A0C0 AAAA AFDA AABF AA9D 5AAA 5AAA 57DA A6AB C2AA 6FC0 2AAA 6BBF 00AA AAEB 00AA AA03 5556 AA02 AAA8 282A AB0A AAB2 AAB6 AA9D AAB5 02AB 55AA 80C2 AAB0 22AB AAD6 AB55 AA00 AA40 AA79 A',
        Base65536: '𤅫肺𣾻𤄋𤶸𤂻𤇃𠪻𤆻偈𣺻𣽛𢨋𠚢𣺻𤅋𤶸𤂻𤄛𤮵𢪻𣪻邼𣹋𤅋炬𤒻𤆍𤾴𤁋𤅋𤃫𤇆傝綺𤇣綸𤷉𡒻𤄻𢊜𤄻邜𥆺𤪺𤊻𤅴𤆂傹𡊻𣼋𤇃𦾸𤑋膻𣹫𣹛𥇇傭𡒴𣼻𤹉𤇣𢊬𣉻𤀻𤇅𤋋𣹋𤀫𣼛𤃇𤃀怜𦪹𧆺𤲄邹𥪖𤎴𠨛炎𢊤炎𢊼𣠻ꋇ𤆂候傜㾬肜𤪔𤮸𤴫憸𢈛㼨𤯋𠆼眻𤺴ᕉ',
        Base2048: 'ۑටलݹञටฅཧஶʈໃŦ௨ਮܘݶذಗไӔƐකІݶಒටࡍݹصටलݲ௭ඈຯঅஶʈໃഡ௨ੲժݢ௨ཙງ൫ৎටफಏ௧Δαཧऊටฦџ௨ೱܘקஶΟໄ๐ஒقฐݹࢲقܨݹऍ੬ဒھۑశະकஶइഥಏதԻѣݸಣҔଜݸ౻ණໄঅࠁඡܘѣஶsࡎח৭ؾ૭ঔதඞ୩ڽഡలѣݢষܯ໐џஹڏ૭חɢචÐלமΟիॾ౯مຯםமȺЉރ௮ൿങھࠐ7'
      }
    }, {
      name: 'Ivenris',
      expectedScore: 22,
      replays: {
        hex: 'EAAA AAAA AB0A AAAA AAAB 0AAA AAAA B00A AAAA AAA9 5AAA AAAA AAD5 6AAA AAAA 0C0A AAAA AAC0 2AAA AAAA 5AAA AAAA AB56 AAAA AAA6 AAAA AAAA D6AA AAAA AAAA AAAA AB6A AAAA AA2A AAAA AAAE AAAA AAAD 56AA AAAA A976 AAAA AA0A AAAA AAA9 6AAA AAA9 6AAA AAAC AAAA AAA8 0AAA AAAA A900 2AAA AAAA A56A AAAA AEAA AAA8 0AAA AAA6 802A AAAA AAB0 AAAA AAC2 AAAA B00A AAAA A5D6 AAAA B00A AAAA 5AAA AAAD 000A AAA9 D6AA AAA6 AAAA AD6A AAAA AAAA AB6A AAAA 2AAA AABA AAAA D56A AAA9 76AA AA0A AAAA A5AA AA5A AAA3 AAAA A02A AAAA 802A AAAA AA56 AAEA AA02 AAAA 6002 AAAA B0AA AB0A AB02 2AA9 75AA B00A A96A AAD5 AAB0 02AA 6AAA D6AA AAAB 6AA2 AAAD 56AA EAAD 5AAC 36AA A5AA CAA8 0AAA 802A AA75 6A80 AAA6 AA00 AA96 AAA8 2A80 2AA8',
        Base65536: '𤇋𤞹𤆻傌𣊻𤄻ꊸ𣾻𤇇冺𤄫炜𢮻𤆻ꊌ𢪻𤆻邌𤆻𤊻𤅋𤆠𡊻𤂻𤇇醻𤅋𤆁𠮻𣾻𤅛㾌𢢻𤆻斄𤆻𤆆𥆸悻纻𤄻傼𤞻𢊻𤄻遜𤦹𡮻𤊻偃膸𤁛𤁋𤇅𣾻𤇄𤆠𤆼𠆜醹𣹋𤄛𣭛䂻𡢻𣦻𤂻𡉫悺綸𤄰傜催嶌𡬋𣻅𣻃𣉛𡉫𣸰𣉋𤅛𣻄𣈋𡉻𤲸冼𢭋㾼𤂂𢨻𣣆肹𣺃𣝛𣾳',
        Base2048: 'ಳටܤݹஜƣແࡑ௨ఽໃݚޛඡܦݹরට๐ݹஜуເঅ௧ڈໃݹ௩Οເɕ௧ڠແऔ௨૮Іܢ௨කܘݓ௨౾Іݠ௨කƔݹகقฆݹϢඈՀݹభඨÐݚѻඍɑݚѻಬໃࡠɷళɑݢ௨ڈໃݷ౫ඡІމமҔธࡨஐට൧ۏଛقԟݱ௨മฆݠ௧ΑషݚɷٴฅՉதฃฅݶذڌฅٽࠑ൝ܘނஐؾʑɥࢶلܪݣ௫سଅݸԫצถܤஓඥ۵ݝ'
      }
    }, {
      name: 'SDA (3)',
      expectedScore: 28,
      replays: {
        hex: '56AA AAAA AABA AAAA AAAA C2AA AAAA AAC2 AAAA AAB0 0AAA AAAA AB00 2AAA AAAB 00AA AAAA AB55 AAAA AAA9 6AAA AAAA AD5A AAAA AAAA AAA9 AAAB 5AAA AAAA AAAA AAAA ADAA AAAA AB55 AAAA AAAD 6AAA AA8A AAAA AAAB AAAA AAAB 56AA AAAA AAAA A82A AAAA B00A AAAA A95E AB55 AAAA AAA6 AAAA A9AA AAAB 55AA AAAE AAAB 56AA AAA5 AAAA B00A AAAA A996 FC02 AAAA AA9A EFC0 2AAA AAAA EB00 AAAA AAA8 0AAA AAAA A0AA AAAA B2AA AAAC 02AA AAAA B6AA AAAB D56A AAAA BF56 AAAA AD56 AAAA F2AA AAAA AAAB F00A AAAA 9AEF C02A AAAA BAC0 2AAA AA9A AAAA A6AA AAAE AAAB 6AAA B5AA AAD5 6AAA AD5A AAAA 02AA AAA8 2AAA AACA AAAC 02AA AAAF 59AA AAAA B55A AAF5 AA95 AA8A ABC0 AAA5 BF00 AAAA 6BBF 00AA AABA C02A AAAF C0AA AAE0 02AA AA56 AAAB AAAB 0AAA B0AA B00A AAB0 0AAB 55AA 96AA AC00 AAB5 6AA6 AAAD 6AAA AAB6 AA2A AAEA AD56 AAD5 AA0A AA95 AACA A80A AA80 2AAA 0356 A80A AA00 AA82 AB6A B56A AD56 ABF0 0AA',
        Base65536: '𤅫𥆹𣾻𤇁𡊻𤄛炜𣺻㿃𢊻𤄻𠆬𢮻𤆻ꊌ𤆻肸邬𤆻𤊻𤅋𠆬𢊻𤅛𤄋𥆸𣊻𤅫𣞻𤊻𤄻𥆆𤇇肹肻𤶺𢊻𤲻𢮻𡊻𤄻𠮄炎𡪻𡒜𤄻𢊬𤄻𤆢傻𡊻𤀋𤇃𤪹𤎻𤅻𤇦𠆬𥚸𤆻炾纺𦧈𤊻炜肻肻𥆺肼邼𠆼𤲸𡢻𣞻𣊻𤈋𤀻𠫕𣺻𣿇𣻕𠙫𥢸趹𤇣𤹉𤇣𢊌𣸻𤇢旈𠲻𥆻催催炌炬𠆌𤂅㿃ꊌ𤂄𤇅肼𤂀𡋋𡉻偫𤊦𠠋為𤲢𣾲𠜻肼𣻆𤓇ᔻ',
        Base2048: 'ۑටݕݹযටະࠇ௧෪ໃܭИටܨݹસට๐ݹஜуໃݶԥڈໃݹ௩Οແऔ௧ฃໂɕ௧ڠແऄ௨ඥܘށ௨ౘЈཧதقഫݪޛೲໄ൫੫ගƬݶԊಋໃݒষܯໃץౚටࢩݹɷගVݪѻචȣݻޛඳଈף௧ڴໃݼѻദݏಏ௩Թໃڽௐقଭނ௩Ϻ༩ݶಈඝଈڍஶs༡ݸ൘Οະऔৡක૭ɒഩಬѣݲষܯະसѻಋଈजƐఽ໐ݪɷٴฅݸౚಀຯஇసضɱŦષට༣ܡஶضʑɠଢമ໘ܣறඡଢڝहథ༣ބஜҕऐ'
      }
    }, {
      name: 'Deasuke',
      expectedScore: 30,
      replays: {
        hex: 'C02A AAAA AAAB 00AA AAAA AC08 AAAA AAC2 AAAA AAAA C2AA AAAA AEAA AAAA AA56 AAAA AAAA B55A AAAA AA96 AAAA AAAA D5AA AAAA A9AA AAAA AAB5 AAAA AAAA AAAA AAAA DAAA AAAA 9756 AAAA AA8A AAAA AAAB AAAA AAAB 5AAA AAAB 56AA AAAA AAAA A82A AAAA B00A AAAA A6D6 AB55 6AAA AAA9 4AAA AAA6 AAAA AD56 AAAA B56A AAAA 032A AAAA A65B F00A AAAA AA6E EFC0 2AAA AAAA EB00 AAAA AAA8 0AAA AAAA 802A AAAA AA54 AAAA AAA1 AAAA AAA0 AAAA AAA0 0AAA AAAA C02A AAAA B002 AAAA B00A AAAC 2AAA AAB0 AAAA AEAA AAA9 5AAA AAA9 D5AA AAA5 AAAA AAB5 6AAA A6AA AAAB 5AAA AAAA AAAA DAAA AAD5 56AA AA2A AAAA BAAA AAD6 AAAB 56AA AAAA 82AA AC02 AAA7 B5AA D556 AAAA 52AA A6AA B55A AB56 AA80 FCAA AAA5 583F 0AAA A9BB BF00 AAAA AE80 32AA AA82 FAAA A802 AAAA 96AA AA1A AAA8 2AAA A00A AAAB 00AA AB00 AAB0 AAAB 0AAB AAA9 5AAA AD56 AA5A AAB5 6AAC 02A9 AAAB 5AAA AAAD AAB5 5AA2 AAAE AA0A AAB2 AAD5 6AB5 AA02 AAA0 0AAA B55A AD6A BAAC 2AAB 0AA0 C2AA C02A',
        Base65536: '𤇃𢊻𤄻嶜𤄋𤇁𡊻𤄛𤆬𠲻𤆻𠆜𢮻𤆻ꊌ𢪻𤆻邌𤆻𤊻𤅋𤲥𣾻𤄋𥆸𣊻𤅛ꊌ𤆻𤆱炼綻𤋅𤅴薹𣪻𣊻𣽻𤇆𤚢𣺻赈𤇣綹𤻈𤇣𤾺𤇃悺𢦻𤂻𤅠㢹𣾻𤄛𤆓𤦹𤊻𤄰炜傼𤞻𢊻𣲻𣺻ꉌ邹𡊻𣹫𤅋𤇅𣾻𤇄𓎜𠚻𤊻𢊻𤉛𤅫𤂑𤃃𡉌𤵛𣹛𤁐𢉋𡉻𡡫𤇠𠞗𤇡𡊄𡒌𣼻燉𣼋𦄘炸邹㢸𠞻𠦻𡊻𣈻𡈻𣈛𡈛ꊺ𠆼𤂅𣻆𣫃𤮺𤊻𡉋㽻𣺬𣈛𡈋𤭻𤂲𣈻𤭻𤊼𢈛儛𡈛ᔺ',
        Base2048: 'ౚටลݹமȺІݿ௨ගÐݸಳටɱݹশට๐ݹஜуເঅ௧ڈໃݹ௩Οເஜ௨ಗໃܭ௨൝ܘܭۑටຜݹౚඦͲஉݣටմݹԥ൝ໃѢ௨ɊІܥࡂܯໃρಛԀໃݪরටเݹਫටঋݹछقฐݹहටܨݹసقܨݺɷඩܘѧ௦قෆऄதටฅ൫ࠑඨɑݹமΟลຍஐق༱ݚذงໃͷશජХࢭಎටȻݢமҔСݐෂඞවౘஓӺХಏமԗVݏआඖໃϠஐΟවݶѻ౾ແࡑࢲඤÐɥઅඪຯஇಈ౾ຣݪذඪϽऔƐڠÐלஜҕɐזѻڐ༥މభ೯۱ࠇࢳ൯'
      }
    }, {
      name: 'chromeyhex',
      expectedScore: 31,
      replays: {
        hex: 'AAAA AAA8 80EA AA82 2A8B AAAA 822A B2AA AAAA AA0E AAAA AAB0 AAAA AAAA AEAA AAAA A56A AAAA 9676 AAA6 5AAA ADAA AAAA A5AA AAAA AA66 DAAA AAA6 AAAA AABA A5AA AAAA AAAA AAAA AAB9 AAAA AA2A AAAA AAAA EAAA AAA0 AAAA AAAA A3AA AAAA 999D AAAA 82AA 2AAA AAA6 9E5A AAAA AA9D AAAA AA88 88AA AAAA 82AB AAAA AAA8 3AAA AAAE 9AAA AAA0 22EA AAAA A082 BAAA AAA5 B6AA AAAA 8BAA AAAA 9EAA AAA2 20AA AAA9 D69A AAAA A2AA AAAA A0A3 AAAA AA0E AAAE A66A AA80 2BAA AA82 AAAA AB95 AAA6 5BAA 6AAA A282 2AAA A9A9 69AA E9AA AAAA BAAA AAA2 AAAA A0A2 AAA8 2C0A AAAA 9AAA AA96 9AAA AAA2 AAAA A80A 996A AE6A AAAA A6AA A0E8 AAA6 AD5A AAAA A8AA AAA2 8EAA A5AA A8A2 82EA AAAA AA28 0AEA AA9A 5AAA A2AE AAA8 0EAA AAAE AAA8 8EAA A579 A95A ADAA 222B 88AA AA76 AAAA AABA AAA0 2A65 ADA9 AAAA AAA3 AAAA EAB3 0A3A AA6D ABAA BC8A ABA8 0ABA 80A3 AB5A 66A9 A9BA AAA6 AA8A B008 AAA8 A99A 9AA8 E69A D602 BA9A AA22 A022 E56A A028 AA9A AAB5 5A6A 9A6A A822 BAA8 FFAA',
        Base65536: '𤂻愈䲻㰋𣻋㼘𤇀𠞻𤇋傜𣾻𤇋𤆦𠪵𤃄遈肼𡮻𤆻絈𤇄𤆴𥆹𤅛𤆻𤺸𤅋𤄋𥆺𠞻𤆻𥆐𠪻𠪄𤇄𣺁𤄋𡪄郈𢪻𤇄㲸㰈𤄋𤊁𤂻𤄜𡪼𣢻𡊀𣺻丘𤇋𤩘𣾻𥄈𠪻𤃋㰈𤀛蹌𤅋𤄋𡚡𤇋𤀜緊𣥋𤆜𤆁𠲼綹𥅘𣹋䰉𣼋蹊𤽋𤅋𤆌𤆰𡚡䲻𤇂𤆤𡪥𣚻𣢻𠮤𤺸𤅋𤂄𡘜羹𤇆㾸㶹𤀌𢙛𡞐𤆌㶺𥄩𡮴㺻𣣋𤃋𣛋𥆀𤺦ꉊ𣛄𠚀𠚜𤆀职𢊻徻蹈𢫄𣾻𤄌𤛋𡛁𡫋羌𡏋㼈𢢌𢢬𥂐𡫅𣪄𡊤肻𣊐㼸𢪠𢪄䂸𡪄趜𥀩𡙋𢢀𡊀𣺆㼩𤂄𡫇𡪴䲹𥄉𨂀',
        Base2048: '௨ഖƌݯߜࠏІWƑsໃa௨೯ܘݷಳජଈیԪؼʥݺԥඞܘݲࠐڄໂঅமةໃݹ௧ړІٽ௨൞ໃZ௨ಘІܥࠐΣІZߜටȜখذජНݹߛeʛݹߤปເѧ௩ԚໂՉࢸටuа௨સȣݷłقෆঅਏeܘԔצقషݸɢڠຜঀಧҸມѧஐට༪൩ԊಅഫܡथsถԡԦԚໃɥஸقࡈɕɠɈไݸצقషݰਵϺФঅஓػݐɓԞуຯɕझࡈ๐ݞझࢶІݞमปദஈƉؿଭݪஸҩЂ൸ԛمϦGƁҨVھԥචЅշࡂ෮लݷƘණ໘ࠅƘಧНקࢻҨฆӘದԋϝପࠑ੧ͳݲடփරݞਵΚϼɢԒԺٳѦԤࠌξGಘسਯܥஶҋϮτथlϼʔ'
      }
    }]

    runs.forEach(run => {
      describe(run.name, () => {
        Object.entries(run.replays).forEach(([encoding, string]) => {
          it(encoding, () => {
            const game = getGame()

            const prompt = jest.spyOn(window, 'prompt')
            prompt.mockReturnValueOnce(string)
            game.instance().handleClickReplay()
            prompt.mockRestore()

            jest.runAllTimers()

            const state = game.state()
            expect(state.mode).toBe('GAME_OVER')
            expect(state.wellStates[state.wellStateId].score).toBe(run.expectedScore)

            game.unmount()
          })
        })
      })
    })
  })
})
