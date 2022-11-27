/* eslint-env jest */

import * as raw from './raw'

describe('raw', () => {
  it('raw', () => {
    expect(raw.encode(['D', 'U', 'L', 'L', 'A', 'R', 'D'])).toBe('DULLARD')
    expect(raw.decode('DULLARD')).toEqual(['D', 'U', 'L', 'L', 'A', 'R', 'D'])
  })
})
