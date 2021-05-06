/* eslint-env jest */

import hatetrisReplayCodec from './hatetris-replay-codec'

describe('hatetrisReplayCodec', () => {
  it('encodes', () => {
    expect(hatetrisReplayCodec.encode(['D', 'D', 'D', 'R', 'U', 'D'])).toBe('ਹ\u200Bԇ')
  })

  it('decodes', () => {
    expect(hatetrisReplayCodec.decode('A9E')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
    expect(hatetrisReplayCodec.decode('𤺤')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
    expect(hatetrisReplayCodec.decode('ਹԇ')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
    expect(hatetrisReplayCodec.decode('ਹ\u200Bԇ')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
  })
})
