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

  it('lets you select a different AI and play a full game with it and provides a replay', async () => {
    renderGame()

    await user.click(screen.getByTestId('select-ai'))
    await user.click(screen.queryAllByTestId('enemy').at(1))
    await user.click(screen.getByTestId('start-button'))
    expect(screen.getByTestId('enemy-short')).toHaveTextContent('AI: ❤️')

    for (let i = 0; i < 187; i++) {
      await user.keyboard('{Down}')
    }

    expect(screen.getByTestId('replay-out')).toHaveTextContent('௨ටໃݹ௨ටໃݹ௨ටໃݹ௨ටໃݹ௨Đ')
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

  describe('when a replay is in progress', () => {
    beforeEach(async () => {
      renderGame()

      const prompt = jest.spyOn(window, 'prompt')
      prompt.mockReturnValueOnce('AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA AAAA A2')
      await user.click(screen.getByTestId('replay-button'))
      expect(prompt.mock.calls).toEqual([
        ['Paste replay string...']
      ])
      prompt.mockRestore()

      // Play three moves of the replay
      jest.advanceTimersByTime(replayTimeout * 3.5)
    })

    it('lets you undo and stops replaying if you do so', async () => {
      await user.keyboard('{Control>}z{/Control}')
      // TODO: assert that `wellStateId` is now 2, down from 3
    })
  })

  describe.skip('check known replays', function () {
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
    }, {
      name: 'knewjade (1)',
      expectedScore: 32,
      replays: {
        hex: '00EA AAAA AAA0 0EAA AAAA A00E AAAA AAC2 AAAA AAAA C2AA AAAA AEAA AAAA AA56 AAAA AAAA B55A AAAA AA96 AAAA AAAA 57AA AAAA A9AA AAAA AAB5 AAAA AAAA AAAA AAAA DAAA AAAA B55A AAAA AA2A AAAA AAAE AAAA AAAD 6AAA AAA0 AAAA AAAA B55A AAAA AAD5 6AAA AB6A AAAA EAAA AAB2 AAAA AAA0 2AAA AAAA A00A AAAA AAAB 0AAA AAAA AC2A AAAA A95E AAAA AAA5 7AAA AAA9 5EAA AAA0 0EAA AAAA A00E AAAA AA80 2AAA AAA0 AAAA AABF 00AA AAAA AAAA AAB5 5AAA AAA0 AAAA AAA0 2AAA AAA2 AAAA AA5A AAAA A80A AAAA AC00 AAAA 9AAA AAA5 6AAA AA8A AAAA AD56 AAAA A02A AAAA 9AAA AAAC 0AAA AAB5 5AAA A8AA AAAA 00EA AAA8 03AA AAC2 AAAA 952A AAAA AAAA 95AA AAAC AAAA AC0A AAAB AAAA AC2A AAAD 56AA AAB5 5AAA AC00 AAAA D6AA AAAD 6AAA A802 AAA2 AAAA B2AA AB2A A95A AAAF C02A AB02 AAB6 AAAB 55AA A5AA AA57 AAA5 7AAF DAAA BAAA AB6A A82A AA6F C02A AAD5 6AA5 7AA0 AAAB 6AA2 AAB0 2AAA 802A AAAA 803A A95E AAD5 6ABF 0AAA E0AA AF5A AAAA 2AB5 5AAF C0AA BB00 2AAB 00AA B55A ADAA 0AAA A2',
        Base65536: '𤄼𠦻𤇋𥆣𡊻𤄛𤞸𤂻𤇋ꊸ𣾻𤇇邺𣺻𤅬肺𣺻𤇅𤆻𤪻𤂻𤇇㾹𣺻𤇋邬𠞻𤆻𠆌𢊻𣽻𤇄𤆬㾼𢢻𤆻𤆃𡊻𤄛傼𡲻𤇋𥆦𠲻𤃋𤄼熺𣾻𤄻𤆁𦦸𤆻𡊻𤅻𤄛𤆒㾸𠮻𣺻𤄫㿃肸ꊻ㾻𤶻𢢻𣪻𤊻𤀫𤇇𤆀𥆳熹𤞻𡲻𤄋ꊻ𤚹𢊻𣸫𣿋𤇁𠆌𤶹𤦻𤈋𤁛𤇅𤂓𣼋𤇀𣿀𤑫𢈻𢈫𤉋𡭻ꎻꎹ肾𤆬肌𤂑𦥈𤶺ꎸ𤂱𣻄𢈋𣤫𣦻𠳋𡋋𦝻𤺹𢌛𣽛𤴋悾𡊌𣼰𣻃𤋇偋ᖰ',
        Base2048: 'ҋටහঅறปະࠇ௨౾ܘݪ௨කଈݷಒටॽݹࡌقไݹஜϺໃݹ௭قງཧடقະঅஶϺຯђ௧ڐໃѣ௧෮ແঅ௫قเݹஒටະࠇ௨සໃϷ௨യІܧಳണІݡಳඝໃܢ௨ಋໃݹஜҔຜݹयටVݶذඖଈށƐలໂ൫ଚඨʑݠ௨੬ໄחસටVݱಳತІࠇநsໃ۹மsลחࢸචÐܭޛೱໃࡆ௩Ϻງஈहഖຽߢ௫ظଈಏরغȣޅதඦଭϷఐؾІɞடජͻݸಒౘϨݪԤsܦݱ௨৭෩ॾಒ༠ฦZৡටҽऔขಅКɓౚಀໄॷஸ3'
      }
    }, {
      name: 'knewjade (2)',
      expectedScore: 34,
      replays: {
        hex: '00EA AAAA AAA0 0EAA AAAA A00E AAAA AA0E AAAA AAAA 0EAA AAAA AEAA AAAA AA56 AAAA AAAA B55A AAAA AA96 AAAA AAAA 57AA AAAA A9AA AAAA AAB5 AAAA AAAA AAAA AAAA DAAA AAAA B55A AAAA AA2A AAAA AAAE AAAA AAA0 AAAA AAAA 8EAA AAAA AD56 AAAA AA80 AAAA AAAA B55A AAAA AB5A AAAA AA80 2AAA AAAA AC2A AAAA AAB0 AAAA AAAD AAAA AAA8 03AA AAAA A803 AAAA AAA5 7AAA AAAA CAAA AAAA 7AAA AAAA 00AA AAAA AD56 AAAA AA2A AAAA AB02 AAAA AAC2 AAAA AB5A AAAA A803 AAAA A82A AAAA 57AA AAAA D56A AAAA 00AA AAA6 AAAA AD56 AAAA AEAA AAAA 2AAA AA80 AAAA AAC0 0AAA A9AA AAAA 56AA AAA8 AAAA AA02 AAAA AB55 AAAA A9AA AAAA C0AA AAAB 55AA AA8A AAAA AC2A AAA8 03AA AAA5 AAAA AAAA AA00 EAAA A56A AAAB 2AAA AB02 AAAA EAAA AB0A AAAB 55AA AAAD 56AA AB00 2AAA B5AA AAA9 7AAA AA00 AAA8 AAAA ACAA AACA AA55 AAAA FC02 AAB0 2AAB 6AAA B55A AA5A AAA5 7AAA 57AA FDAA ABAA AAB6 AA82 AAA6 FC02 AAAD 56AA 57AA 0AAA B6AA 2AAB 02AA A802 AAAA AB00 AA95 EAAD 56AB F0AA AE0A AAF5 AAAA AD56 A8AA FC0A ABB0 02AA B00A AB55 AADA A0AA AA',
        Base65536: '𤄼𠦻𤇋𥆣𠞻𤇋冸𤂻𤇋ꊸ𣾻𤇇邺𣺻𤅬肺𣺻𤇅𤆻𤪻𤂻𤇇㾹𣺻𤇋𤆡𠚻𤇋𠆬𡢻𤆻𠆌𡊻𤅛𤆣𡊻𤄛傼𢊻𤅋𥆣𢦻𤇋𥆖𢊻𤄋𥆔𡦻𣾻𤇇㾸𢊻𤄫傌𤮻𣺻𤄼𤆡𥆦𤶻𢦻𡪻𣊻𤁻𤇋𤆀𤆲於𠪻𣲻𣚻𣢻𤊻𤁻𤅋𤇂𠆬㾸𤞻𡦻𣿋𤅛熻𠲻𢊻𣼋𤇂𤆌傜𤶸𢊻𤉻𤄰𤇅𥆥点𤆠㾜㾼𤆗𣿣𣿂𤇄𣿇𣱛𡳋𦫋𥆺𤪸傹𡒤𣈻𠱻僋肬𣾀𤇂𤄻𣻃𣹬𤓇𢈛𣾁𤇕𠆜𦠋𤺸㿃炜𠆌𣟄ᖻ',
        Base2048: 'ҋටහঅறปຯѧ௨దІݪ௨කଈݷಒටॽݹࡌقไݹஜϺໃݹ௭قງཧடقະঅரටຯɥ௨ڐໃΜ௨ಀໃܭذඡໃݶభටໞݹলقโঅறปາർ௧ලໃυ௨ಣໃѣ௨డໃћ௨౾ܘރ௨యІӃளڠໄཧਫඞІף௨ڠຯɕଫඨƔݶԥඐໂɕଫඨʑݢ௨෦ແऔஐقໞݷҋඞܘݹҋකଈљ௧෦ະঅযටУݷಒඩషރ௨ϾາݸƐ೯ІߢইනຽࡁলكʑϠ୷ظଭಠઽගȣͷਵܯງཤ۳इଞܡமɈഉݺѺчฅཫɶญܔમமҒЏהಛɜลݶಒ෮ಊ3'
      }
    }, {
      name: 'knewjade (3)',
      expectedScore: 41,
      replays: {
        hex: '56AA AAAA AA96 AAAA AAAA 57AA AAAA AC2A AAAA AAAC 2AAA AAAA 00EA AAAA AAAD 56AA AAAA AC00 AAAA AAAC 02AA AAAA AEAA AAAA AAFD AAAA AAAA EAAA AAAA A95A AAAA AAA5 6AAA AAAA 56AA AAAA 95AA AAAA BAAA AAAA B2AA AAAA AA00 EAAA AAAA C0AA AAAA AC00 AAAA AACA AAAA AAB8 2AAA AAAA 00EA AAAA AAAA AAAB AAAA AA80 96AA AAAA ADAA AAAA 95AA AAAA A55E AAAA AACA AAAA AA96 AAAA A82A AAAA AB55 AAAA AAFE AAAA AAE0 0AAA AAAA 0AAA AAAA D56A AAAA AAAA AAA8 02AA AAAA B0AA AAAA 5AAA AAA9 5EAA AAA0 0AAA AAA0 0AAA AABA AAAA AD56 AAAA 95EA AAAB 6AAA AABF 00AA AAAB D6AA AAAC AAAA AAA0 0AAA AAB6 AAAA ACAA AAAA 96AA AA82 AAAA ABFA AAAA BB02 AAAA A00E AAAA B6AA AA95 AAAA A957 AAAA ACAA AAAA C00A AAA8 2AAA AA00 EAAA AAAA ABAA AA80 96AA AAAD AAAA 95AA AAA5 5EAA AACA AAAA 96AA A82A AAAB 55AA AAFE AAAA E00A AAAA 0AAA AAD5 6AAA AAAA A802 AAAA B0AA AA5A AAA9 5EAA A00A AAA0 0AAA BAAA AD56 AA95 EAAB 6AAA BF00 AAAB D6AA ACAA AAA0 0AAA B6AA ACAA AA96 AA80 AAAB 55AA BFAA AE00 EAA8 2AAA D6AA 00EA 8AA9 AD56 AA2A A656 A8AA 5602 AA0A A802 AA00 AAAA B2AA BAD6 AAD5 6AAB F00A A55E AACA AAEC AAA5 6AAE AA00 AA95 AAB2 AAC2 AAEA',
        Base65536: '𤅫邹𣺻𤅬𤞹𤆻傌𢦻𤇋𤶸𤂻㿃𢊻𤄻𤆬𡒻𤅋𤆼𡲻𤆻𤅫𤆦ꊹ𡊻𤂻𤇀𠦻𤇋悬𢊻𤄰㾼𣊻𤆁熺𤆻𢊻𣺻逨𣊻𤅋𤆆𠊹𣺻𤇀邺傻𢊻𤅻𤇫𠦌𣾻𤄛𠆜𤆻点𢊻𤄛𤅛𥆆為炻𥆺𤶻𡲻𣿋𤇄炾𥮺𣊻𤄋𤆓肬𤚺𣺻𣽛𤄛𤃫𤣈𢦻𣿋𤇄𤆖𥆧𤚹𤊻𤄰𤆁𥆣𣾻𣻋逨𤪺𠲻𡶻𣻋𤇀𤆥𣼛𤇇𣻫烈傹𤶹𤆻𤆓傜𤆵𥆆𤆣𣈻𤶻ꎹ𤪹𦦻𥮺𤚺𡦻𤪺𤚺𠮻悹𠆬𣾎燈傹邬𥆃𠨋𠆜𣺀ꉈ鴋𠜫炸𤆃㾌𢊜𡉛𢑻𠈻𤚸𤺹𣿀𡉫炸𣺆𣻀𣻁ᗊ',
        Base2048: 'ۑටדݹࡌقลђ௧ٴໃԄ௨ගʑݸసقลݹஶقະಠ௨ปໃϳ௨୮ເ൫நقฆݹવقຯމ௨ټໃџƐඩІݪߤටऒݹ௨ೲໃmذඤȣݶۑඞ༱ݶతටॽݯ௨ೱໃ߂௧ڒໃݏ௨ೱໃݹணටลђ୭ටɳݸѻൿແঅ௮ටجݷ౫ඨऐݫذ൜Іݑ௨ڄແߢ௧Ϻฐݹຕ൞Иݸҋචȣݔ௨Ҙຽߢ௩ɜຯђਬقຽঅࠀϺງঅࡋඞ༱ܭƐപຜݷಒපະज௧इลཧ௧৩ลђذౘЂݹѻڠ༩ݔಲ෮໓ݸ൙൜ІδષؾVܦணؾʑʅষʌฐݪدʌషŒಒడෆƞƎҰවܤஒටДݚলගʑҁஎضVѤతರฆܤகضVɛஜכ'
      }
    }, {
      name: 'knewjade (4)',
      expectedScore: 66,
      replays: {
        hex: '56AA AAAA AA96 AAAA AAAA D56A AAAA AA02 AAAA AAAA 802A AAAA AAAC 00AA AAAA ABF0 2AAA AAAA D56A AAAA AD56 AAAA B0AA AAAA ABAA AAAA AA9A AAAA AAAA AAAA AAA5 B002 AAAA AAC0 2AAA AAA0 3AAA AAAA AAAA AA96 FEAA AAAA AEAA AAAA 580A AAAA AEAA AAAA 2A00 EAAA AA2A AAAA AFC2 AAAA ABD5 6AAA AAA6 AAAA AAD5 6AAA AA80 3AAA AA8A AAAA A82A AAAA 803A AAAA DAAA AAAA CA56 AAAA AA6A AAAA AD56 AAAA AEAA AAAA 03AA AAAA D56A AAAB 002A AAAA C2AA AAAB F5AA AAAA B9AA AAAA A02A AAAA B0AA AAA8 02AA AAF5 6AAA AABA AAAA AAED 56AA AA2A AAAB F5AA AAA8 ABB0 AAAA AD6A AAAA 22AF D6AA AAAE C0AA AAA8 03AA AAAA AAAA AD56 AAAA AFD6 AAAA AE0A AAAA AAAA AAAD 56AA AA80 2AAA AAAA AAA9 682A AAAA B55A AAAD AAAA AABA F00A AAAA ACAA AAAA 55FA AA80 2AAA AB6A AAAA AEFD 6AAA AAAE 02AA AAA2 AAAA AFD6 AAAA B803 AAAA AC0A AAAF DAAA AAAB B0AA AABA AAAA CB6A AAAA B002 AAAA 96AA AAA9 AAAA AA00 AAAA AD56 AAAA AC0A AAAB D6AA AAAE AAAA AA0A AAAB F00A AAA5 7AAA AAD5 6AAA A6AA AA2A AAAF C0AA AABF 0AAA AF55 AAAA 9AAA A803 AAAB 55AA AA2A AAA0 AAAA 00EA AB6A AAAB 295A AAA9 AAAA B55A AABA AAAB 55AA AC00 AAAB 00AA A03A AAAC 2AAA BF5A AAAB 9AAA AA00 AABD 5AAA AD56 ABAA AAAE FDAA AAAE AAA8 080A AAAA A5BA AAED AAAA 2ACA AADA AAB8 02AA AB55 AAAB 0AAB F5AA ABB6 AAAA E957 EAAA FC2A AF00 AAAB B00A AAC0 2AB6 AAAA E56A A9AA AC2A AEAA B9AA A895 AAAB 5AAA AAD5 6AAB 002A AB00 AAAB 5AAA A95E AAA8 02AA 0AAB 6AAA CA56 AA9A AAD6 ABFA AB95 EAAB 55AA B002 AA5A AFAA B02A A659 DAC0 AAA6 5AEA AC0A AA9A B02A AABF 0AAA B95A AAAF 55AA A00E AAA0 AAAB 55AA AAAA 6AA8 02AA A56A A6AA 00EA A0AA A803 AAAA BD56 AB0A A95A A2A9 5B2A AEA8 02AA 0AAB AA',
        Base65536: '𤅫邹𣺻𤇇悺𣾻𤄻𤦸𤄋悮𣊻𤅻𠆌𤞹𤂻𤇋肸𤆻𣮻斌𣺻𤇃憸𤆻𢮻𤆎𥆺𠮻𤆂𤆼㺸𤄼𤆠𦞸𤎻𤅻𤆄𤶸𣦻𤃋𤄋𤆁𥆳𤪹𣾻𡳀𣺻𤅋𠆌𥆺𠢻𤇋𤇇斜𣊻𤄛𤇥𤺸𤅋𤆒傼為𥲸𤊻𣾻𤷈𠚻𢒻𤁛𤸊𤇁邜㲺𦬊𣊻悌熺𤆻𤶹𣒻𤁛僈𤆻𠆼点𤆻𡞕𤊻𤉻𤅋𢎌𤄻𤇀𦆷𤆣肜𡊻邎𡊻𤆂𤆠邮𤺹𤄼悜肾𡊻傌𥆸𤚹肌𤦻𣼋𤅛𤅋𣼻𤇇悬𥮸𣊻𣺻𣸛𤇣𤅬𠆜肸㾸𦢸𡒻𤌛𣹻𣹋𤀼𤇇𣸋𣤛𢋋𣽋𡳀𠪻𡊻𣉻𡊻𢉻𤀰𣿃𤄬𤇁𤇥𠪌𡦻𥲸𤶻𤆼𡒜𣽋𣣋𤆂𡊵𤺹𤇄𤘊𤪹𤺺𤈻𣉻𡐛𣉛肌𤾸𤁽𣻡𤃓𤧈𤦹肼𤺸𡩫𤞹𥆸𠪜㲺𣉫𣽛𣿇㿃炜邬ꎸ炻𣺁𤃄𡳀肹邜𡋫𥆆𠆜斌邸𡋛𠨫𠪅𢋄𡨫𢊅𤢸羺𤇂𤃡ꋈ𠆽𥆓𤂡𤇇𣾴𢰻肸𥆃𤂁𤄼𠆍𣻁㽫𤙨𥆸𠜻𥂸',
        Base2048: 'ۑටדݹࢶටเݹணටະࡆ௨൨ଈݪޛගʑݚɷඤІݶԥටໃیసقฅݹஒڠໃݸףقຈݹࡂɈ໐ݹߜʌເɕஞƣ໑ཧஓقฅཧଶقࠃݶɷඅІѠ௨೯ΞݹࠑටУݸಳඖଭݺޛ೯షݪɷඳܘܭࠑටԟݺɷഢະ૨௩قฦɡ௧sษஈਐڕÐݚذഖTಱஶӶଈԄ௨ටݍݸบඤʝݹ௨ซາݹ௨ಬӿݺޛ෮ໃɣറඨVݵඓʈลঅஜԁܘܭࠁඡІظ௧ญ༱ݚϢ༬ໃɢభගІљࢴق༠ɕॳඦІڭமҔງחࢽටଭݶɷಋໂർமҔෆݶƐಋଈɻ௩ఋෆݶҋ൝ໂɕߤඅϿࡨமjଈŦஜҔଭܭޚ෨ЄࡑरكÐޣ௧ړІδऄكʑঅষݐຽঅκق൝ॿಛΟవߢলؾʡݺޛٴฉஇಛΟฆАஷƣмݪࢳචƬࡨஜӀถݚɶڠݎঀıؾɑݚޚ෨ϿࡑષටɳݱஐගȣלॻಧลஎஜӃϿऔࢳࡄɑஅవలɊঐরظʥѧࢳؼϝח෩൞ɱޕணปࡍף௨੬ՀԴࠑయϼяҋග٠ࠇࡋࡃਥɒಯඖܒॵ'
      }
    }, {
      name: 'David & Felipe',
      expectedScore: 86,
      replays: {
        hex: '56AA AAAA AAB5 5AAA AAAA 80AA AAAA AAA6 AAAA AAA9 802A AAAA AAAC 00AA AAAA A802 AAAA ABF0 0AAA AAC0 2AAA BFAA AAAA A02E AAAA AA82 EAAA AAAA A6AA AAAA AAD5 6AAA AAAA 56AA AAAA 6AAA AAA2 AAAA AAC2 AAAA ABBA AAAA AAAA 56AA AAAA A6AA AAAA AFC0 AAAA ABD5 6AAA AAAF 56AA AAAB FAAA AAA8 2D5A AAAB 6AAA A6EA AAAA BEED 56AA AAAC 00AA AAA8 EAAA AAAB B80A AAAA AAAA AAD5 6AAA A95A AAA8 AAAB ABB9 6AAA A00A AAAA BAAA AAAE F2EE AAAA ABBB 00AA AAAD 56AA AAC0 0AAA AABA AAAA A7EE D5AA AAB0 AAAA AAAA AAAA CAAA AAAC 00AA AAAC 00AA AC0A AAAA B6AA BEAA BAAA AAAA D5AA AAAA D56A AAAA F55A AAA8 0AAA AA8E AAAA AAEC 0AAA ABAA AAAA FB82 AAAA 802A AAB5 6AAA AB6A AAAB 8B2A 6AAA AA2A AAAA FC02 AAAA C02A AAFC 2AAA ABD5 6AAA AA6A AAAA D56A AAA8 AAAA A82A AAAB 6AAA AA8E 95AA AAAB 55AA AA6A AAAA EAAA AAD5 6AAA B0AA AAAC 0AAA AADA AAAA DFBA A6AA AAC0 2AAA AAB5 5AAA 80AA AAA0 0AAA ABF0 0AAA BEAA A95A AAAA BAEE FEAA AAA9 E00A AAAC 02AA 56AA A0AA AADB EAAB B556 AAAA A80B AAAA B6B2 AAAB FAFE EAAA A9AF E9AA B82A AAAA AAAA B55A AAA8 02AA AABF 5AAA AB82 AAAA AAAA AB55 AAAA D56A AFC0 2AAA AAAA A96A AAAA AA02 AAAA AC02 AAAA AAAA A82F C02A AAF5 5AAB AAAA 89AA AEAA E5AA AC02 AA8A AAA5 FDAB 80AA AAAA ACAA AEE0 6AAA 80AA A96A AAB0 0AAA 9AAA AC0A A95E 6AAA 56AA A5AA AEAA AA52 AC00 AAAB AAAA B82D 56AA C02A BFBE AAAB AAAA 82EA AA9A 7EEC 02AB FAAA AA6E AAAA A02A AB55 AAA2 AA96 AA95 AA80 AAAD AAA8 2AD5 6AB6 AAA6 6FDA AAAA EDAA AFB8 AAAA C0AA AA80 2AAA B0AA AC2A 9AAA AEAA AAEB 55AA AAF5 5AAA F00A AAA0 0AAA EAAA AEC0 2ABF 6AAA AE02 AA2A AD56 AAD9 AA8B CAA6 AABF 0AA8 AA56 AA9D AAA8 BAD5 6AAC 2ABF 5AAA AB82 AB00 AAAA 76AA A3EE 0B00 AAAC 02A9 FDAA AEDA ABBB 55AA AFD6 AABA AAAD 56AA FCAA A00A AA9A A9AD AAAA E82A ABF0 AAF5 5AA9 AA8B F00A AAB0 0AA9 6AAD AAAA EFDA AAA7 BF6A AABB AAAA 56AA AB0A AAB2 AAB0 0AAA 96AA AD56 AAB0 0AAA 6AAA D5AA DAA6 C0AA A02A AD56 AAAA FCAA A7B0 02AA C0AA 9AAD 56AB F2AA B95A AFCA AB80 AAA5 6AA2 AA96 A800 AAA2 A9B0 AAB5 5AA2 AA00 AA96 AAA8 2A80 2AA8',
        Base65536: '𤅫𤶹𤂻𤄫肹𣪻𤆃𡊻𤄰為𦦻𢊻𤐻𣾻𥄨𡞻𤆌𠪻𤆻𠆌𢲻𣺻𤅋𤆀𤞸𤊻𤆌𡲻𤂻𤅋悮𥶺𣺻𤇖𤆾䲸𤇆肌綸𤇋𤻘𤇇斬𢚻𤇋𡊜𤆂𣾻𤇇𤆖𤂀𤻊郈炸𥆺𤺻𡋐𤆌𡊼炌𤶹𡊻𤄰𤆬𥺴𤳈𡊻𤄛𤊻𤄋㿃𤦹𢈋𤀫𣿄𢋛𣾻𤇆𠆼𥶺𠢻𢚻𤇋𡊌𣸫𤇋𤻘𣼛𤈻𣽫𤇄𠚜㺌𤁋𤀋𤇣炌傮𥶹𢪻𣊻𣽻𤀋𣼛𤇄𤾰𤁫𤇇𤁋𤃋𤇇𤇁悜𤪹𢊻𡉍𤆴炌𤶻悺点𦦸𦆺𤆶𢊬𡒌𣪻烈炼𤂆𤈛𦅈𡊜𤅴𡊲𡊻𤙉𦾻𥇨纹胩𠞌𤆻𠆼炸𦮹𡊻𤆁𤊻𤉻𡑻𤄻邹𢢻𣊻𤄻䲻𤃣𣻗𣻋耈𣺜郈炜𤆐罞惈𢊻𢈋𠞌𣡋邺炼𤆤𣻂𠩬ꊺ𣾥𣻋𣉐𤀰𣻋䳈𣻇𤓃𤆍𣻋𥄘𡪴𤻘𤓃𡪻𤆌𣾢𣿇𡬋ꊹ𣾂𤃄𤴚肼𠪤肎𤺹𣿄𤻘𤈋𣸫𤈻𢈛耛𤆼𢊌𤍻𢍻𣤻𥆹𤺸𤓃𣹋惈𣺀𣻇𠫄㲸𣫐𦞹㾸𡩫𤃄𤼈𣻇𤓁𣹛僈𤇃职𥺠䳈𣿃𣫃𣿤𤫈𤺸𤷈𦮹𥆹𠆼㾎𤂓𠩋肜𡞼𦞹𠆽𣺄𦤈𤦺邸肌𡒼𣩋𦫈𤺻𣳋𤞻𤚺𤦹邺𠆬炜𤂔𤋆絋𣿂𡈫𣹻𣿠𡉌𣸰𣻂𤵋㾾𠲜㾾𠢌ꊹ𣾀敛㾹𤝈𤶸𣺰𠬻傻𡘻',
        Base2048: 'ۑටݍݹਢටถݹୠʈໃɝƐඡໃޡ௧෪໔ݹमڠາР௨කІݶಒටথݶԥඖІܭɷණЫݹॻටलݸขඤ٠ݶൡඨଈܢࢶقНݶԎقཝथޛ൜షݞಳචͳp௨චʑݔ௧sଫथࡃඖໃק௩Ӽͳɥ௩ӺЛݷಒගƔݸಳඉڋɠ௧ٴໃݹతඨƔݷసغƊݪԤອݕݷಈඨʑݫޛపເɥ௧ڕƊܭ௨ຜʝݷѻงຽࡨமҨДԓரقஞݶౚ൨ܘѳ௨ΟງཧञඡܘѠ௨ࡈتݪޛ੬ຈݸಒඩܘћ௧෮ຽࡪࢸ੬ฅݹ௮ඡଈδஞʈஃ۹ஶԻХ൫୦Ҵໄݶۑƣ༣ɵষڏІښಳಀαɕ๔Ӻາऽ३ಅÐݹ௮ටƬݜذಅÐݹ௮ඨʑɽ௨ඞܘݠ௨ڀໃݯऊඤ٠ɥஐҸฦܭࡃ೯າɕنօƊݷతೲФτଫപໄݸԥ෦෩झளؼܔঅࠔփషקஜҬУܭѽӾ໐ݶɠفΚଡࢳපາथ௨Ɉݍݎதඞ૭ו౫ചତނலҸѥݷಛΟݯङ௩ɈහݺɶසഫމஜԺໃଌৠඥຽঅࢷڀငݶಖسϽऔࢴҸරɪୡഊܐɐதڄฮɣಒ౾ܝஈࢷƤƬھԥÆФРѺ෪രॿಛΟХथޚ༰ฦݺޚܣดݢஓԺІफயƤ٠Ŧߛܯງݶدڄ໐ɾௐڕलކಳ୮ໞݪƏ෪๐ݪޚ෪ถݪےΞͲוϡڐະఫ४Ӷషɜஓم໓ɓಘ١ϽछநسϾ୴ƏࡃͲэಒࡄƬƎଢ৩Ӈ'
      }
    }]

    runs.forEach(run => {
      describe(run.name, () => {
        Object.entries(run.replays).forEach(([encoding, string]) => {
          it(encoding, async () => {
            const warn = console.warn
            console.warn = jest.fn()

            renderGame()

            const prompt = jest.spyOn(window, 'prompt')
            prompt.mockReturnValueOnce(string)
            await user.click(screen.getByTestId('replay-button'))
            expect(prompt.mock.calls).toEqual([
              ['Paste replay string...']
            ])
            prompt.mockRestore()

            jest.runAllTimers()

            expect(screen.getByTestId('score')).toHaveTextContent(String(run.expectedScore))
            if (encoding === 'Base2048') {
              expect(screen.getByTestId('replay-out')).toHaveTextContent(string)
            } else {
              // Other encodings have differing amounts of padding so result in slightly
              // different output Base2048
            }

            // Copy the replay
            await user.click(screen.getByTestId('copy-replay'))
            const contents = await navigator.clipboard.readText()
            if (encoding === 'Base2048') {
              expect(contents).toBe(string)
            } else {
              // Other encodings have differing amounts of padding so result in slightly
              // different output Base2048
            }

            // "copied!" disappears after a while
            expect(screen.getByTestId('copy-replay')).toHaveTextContent('copied!')

            jest.runAllTimers()

            expect(screen.getByTestId('copy-replay')).toHaveTextContent('copy replay')

            await user.click(screen.getByTestId('done'))

            // TODO: maybe some assertions about how many trailing moves were ignored
            console.warn = warn
          })
        })
      })
    })
  })

  describe.skip('Brzustowski algorithm', () => {
    it('works?', async () => {
      const replay = 'ౚටฅٽ௨෨ଈݚСචƘݷౚ೯ບߢ௨චÐݺɷගÐݚɷ౾ܖࠆಛقຽঅ௩قଭݪ௧ڠଭɟ௨ගɑݸ౻ටПݹ౻ඪܖࢭࢶටະऔ௨ชІݶಒටତݹ௮੬ໃए௨ඩషݹࢳΟໃঅ௩Ϻසݶ౻ටลɒƐปໄஈб೯ܘމலڄໃѣҳబຽࢭ௧پܖࠇமقܬݶసطДݺஶϺ༠ɖɷڠПݚݫට༨অ௩Ѳໃףذචʃݹ୦Ѹໃɠ௨ಀІݪɷలฅהԥೱ൧ݺذගІܭϟقܯஈলටݕݺɷඪ൧ރ௧ڠໞݶಏكɑקযඤʃܭدڠЖܭИටКђ௬ට༠ݹଛʈໄຍ௩Ϻໄຍஶشܙਨ௩ѸແࡨߛࡆІܭЬقଚԓஶѮໄຍ४ΟฦݶƖقФ୬௧ٴະࡆذ౾ಊݪСඦബঅࢴඥܨІةɤໃקਙชІࢭরइໄЅЗࡄฅݹઽඨƞݷసقʃࢭࠒΟฆݹߝɈฅђߝԚໄŦ௬ॴ༠הభ൝Іࢭஜу༨ঀಇΘuঅఴуଞݺد෪ງڝࢶ੬ПܭɷٯฦݚСಀഫɟஜضÐɝɴฃ༥މభ෨ܐঔਆ'
      const expectedScore = 55

      const warn = console.warn
      console.warn = jest.fn()

      renderGame()

      await user.click(screen.getByTestId('select-ai'))
      await user.click(screen.queryAllByTestId('enemy').at(2))

      const prompt = jest.spyOn(window, 'prompt')
      prompt.mockReturnValueOnce(replay)
      await user.click(screen.getByTestId('replay-button'))
      expect(prompt.mock.calls).toEqual([
        ['Paste replay string...']
      ])
      prompt.mockRestore()

      // Replay is about 2400 moves long
      jest.advanceTimersByTime(replayTimeout * 10000)

      expect(screen.getByTestId('score')).toHaveTextContent(String(expectedScore))
      console.warn = warn
    })
  })
})
