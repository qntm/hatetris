/* eslint-env jest */

import hex from './hex'

describe('hex', () => {
  it('works', () => {
    expect(hex.encode('LLLRLDLURLRRRDRUDLDRDDDUULURUDUU'.split(''))).toBe('0123 4567 89AB CDEF ')
    expect(hex.decode('0123 4567 89AB CDEF ')).toEqual('LLLRLDLURLRRRDRUDLDRDDDUULURUDUU'.split(''))
  })

  it('adds an extra D to shore up the count if need be', () => {
    expect(hex.encode(['L'])).toBe(hex.encode(['L', 'D']))
    expect(hex.encode(['R'])).toBe(hex.encode(['R', 'D']))
    expect(hex.encode(['D'])).toBe(hex.encode(['D', 'D']))
    expect(hex.encode(['U'])).toBe(hex.encode(['U', 'D']))
  })
})
