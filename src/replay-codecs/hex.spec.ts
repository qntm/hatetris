/* eslint-env jest */

import hex from './hex'

describe('hex', () => {
  it('works', () => {
    expect(hex.encode([
      'L', 'L', 'L', 'R', 'L', 'D', 'L', 'U', 'R', 'L', 'R', 'R', 'R', 'D',
      'R', 'U', 'D', 'L', 'D', 'R', 'D', 'D', 'D', 'U', 'U', 'L', 'U', 'R',
      'U', 'D', 'U', 'U'
    ])).toBe('0123 4567 89AB CDEF ')
    expect(hex.decode('0123 4567 89AB CDEF ')).toEqual([
      'L', 'L', 'L', 'R', 'L', 'D', 'L', 'U', 'R', 'L', 'R', 'R', 'R', 'D',
      'R', 'U', 'D', 'L', 'D', 'R', 'D', 'D', 'D', 'U', 'U', 'L', 'U', 'R',
      'U', 'D', 'U', 'U'
    ])
  })

  it('adds an extra D to shore up the count if need be', () => {
    expect(hex.encode(['L'])).toBe(hex.encode(['L', 'D']))
    expect(hex.encode(['R'])).toBe(hex.encode(['R', 'D']))
    expect(hex.encode(['D'])).toBe(hex.encode(['D', 'D']))
    expect(hex.encode(['U'])).toBe(hex.encode(['U', 'D']))
  })
})
