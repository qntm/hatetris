/* eslint-env jest */

import * as base65536 from './base65536.ts'

describe('base65536', () => {
  it('works', () => {
    expect(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D'])).toBe('𤺤')
    expect(base65536.decode('𤺤')).toEqual(['D', 'D', 'D', 'R', 'U', 'D'])
  })

  it('adds an extra run to shore up the octet count if need be', () => {
    expect(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U'])).toBe('𤺤ᗐ')
    expect(base65536.encode(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])).toBe('𤺤ᗐ')
    expect(base65536.decode('𤺤ᗐ'))
      .toEqual(['D', 'D', 'D', 'R', 'U', 'D', 'U', 'U', 'L'])
  })
})
