import assert from 'node:assert/strict'

import { describe, it } from 'mocha'
import * as raw from '../../src/replay-codecs/raw.js'

describe('raw', () => {
  it('raw', () => {
    assert.equal(raw.encode(['D', 'U', 'L', 'L', 'A', 'R', 'D']), 'DULLARD')
    assert.deepEqual(raw.decode('DULLARD'), ['D', 'U', 'L', 'L', 'A', 'R', 'D'])
  })
})
