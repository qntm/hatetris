/* eslint-env jest */

import * as space2048 from './space2048'

describe('space2048', () => {
  it('works', () => {
    expect(space2048.encode(['D', 'D', 'D', 'R', 'U', 'D'])).toBe('ਹ\u200Bԇ')
    expect(space2048.decode('ਹ\u200Bԇ')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    expect(space2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U'])).toBe('ਹ\u200BӼ\u200B1')
    expect(space2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])).toBe('ਹ\u200BӼ\u200B1')
    expect(space2048.decode('ਹ\u200BӼ\u200B1'))
      .toEqual(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
