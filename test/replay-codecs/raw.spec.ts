import * as assert from 'node:assert'
import { describe, it } from 'mocha'
import * as raw from '../../src/replay-codecs/raw.js'

describe('raw', () => {
  it('raw', () => {
    assert.strictEqual(raw.encode(['D', 'U', 'L', 'L', 'A', 'R', 'D']), 'DULLARD')
    assert.deepStrictEqual(raw.decode('DULLARD'), ['D', 'U', 'L', 'L', 'A', 'R', 'D'])
  })
})
