import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Tree } from '../../src/enemy-ais/tree.ts'

describe('tree.ts', () => {
  describe('Tree', () => {
    it('root node value', () => {
      const tree = new Tree<string, number>()
      assert.equal(tree.get([]), undefined)
      tree.set([], 100)
      assert.equal(tree.get([]), 100)

      tree.set(['x'], 1000)
      assert.equal(tree.get(['x']), 1000)
      
      tree.set([], 37)
      tree.set(['a', 'b'], 37.5)
      tree.set(['a', 'b', 'c'], 38)
      tree.set(['a', 'b', 'd'], 39)
      assert.equal(tree.get([]), 37)
      assert.equal(tree.get(['a']), undefined)
      assert.equal(tree.get(['a', 'z']), undefined)
      assert.equal(tree.get(['a', 'b']), 37.5)
      assert.equal(tree.get(['a', 'b', 'c']), 38)
      assert.equal(tree.get(['a', 'b', 'd']), 39)
      assert.equal(tree.get(['a', 'b', 'e']), undefined)
      assert.equal(tree.get(['a', 'b', 'c', 'x']), undefined)
      assert.equal(tree.get(['a', 'b', 'f', 'y']), undefined)

      assert.deepEqual([...tree.entries()], [
        [[], 37],
        [['x'], 1000],
        [['a', 'b'], 37.5],
        [['a', 'b', 'c'], 38],
        [['a', 'b', 'd'], 39],
      ])

      assert.throws(() => tree.get([], -1), Error('path index out of bounds'))
      assert.throws(() => tree.set(['a', 'b', 'c'], 600, 4), Error('path index out of bounds'))
    })
  })
})
