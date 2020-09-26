/* eslint-env jest */

import replay from './replay'

describe('replay', () => {
  it('works', () => {
    expect(replay.encode(['D', 'D', 'D', 'R', 'U', 'D'])).toBe('ਹԇ')
    expect(replay.decode('A9E')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
    expect(replay.decode('𤺤')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
    expect(replay.decode('ਹԇ')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
  })
})
