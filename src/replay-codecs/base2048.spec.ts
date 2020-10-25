/* eslint-env jest */

import * as base2048 from './base2048.ts'

describe('base2048', () => {
  it('works', () => {
    expect(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D'])).toBe('ਹԇ')
    expect(base2048.decode('ਹԇ')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    expect(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U'])).toBe('ਹӼ1')
    expect(base2048.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])).toBe('ਹӼ1')
    expect(base2048.decode('ਹӼ1'))
      .toEqual(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
