/* eslint-env jest */

import assert from 'node:assert'
import hatetrisRotationSystem from './hatetris-rotation-system'

describe('hatetrisRotationSystem', () => {
  it('has the right rotations', () => {
    assert.deepStrictEqual(hatetrisRotationSystem.rotations, {
      S: [
        { xMin: 1, yMin: 1, xDim: 3, yDim: 2, rows: [6, 3] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 3, rows: [1, 3, 2] },
        { xMin: 0, yMin: 1, xDim: 3, yDim: 2, rows: [6, 3] },
        { xMin: 1, yMin: 0, xDim: 2, yDim: 3, rows: [1, 3, 2] }
      ],
      Z: [
        { xMin: 1, yMin: 1, xDim: 3, yDim: 2, rows: [3, 6] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 3, rows: [2, 3, 1] },
        { xMin: 0, yMin: 1, xDim: 3, yDim: 2, rows: [3, 6] },
        { xMin: 1, yMin: 0, xDim: 2, yDim: 3, rows: [2, 3, 1] }
      ],
      O: [
        { xMin: 1, yMin: 1, xDim: 2, yDim: 2, rows: [3, 3] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 2, rows: [3, 3] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 2, rows: [3, 3] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 2, rows: [3, 3] }
      ],
      I: [
        { xMin: 0, yMin: 1, xDim: 4, yDim: 1, rows: [15] },
        { xMin: 2, yMin: 0, xDim: 1, yDim: 4, rows: [1, 1, 1, 1] },
        { xMin: 0, yMin: 2, xDim: 4, yDim: 1, rows: [15] },
        { xMin: 1, yMin: 0, xDim: 1, yDim: 4, rows: [1, 1, 1, 1] }
      ],
      L: [
        { xMin: 1, yMin: 1, xDim: 3, yDim: 2, rows: [7, 1] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 3, rows: [3, 2, 2] },
        { xMin: 0, yMin: 1, xDim: 3, yDim: 2, rows: [4, 7] },
        { xMin: 1, yMin: 0, xDim: 2, yDim: 3, rows: [1, 1, 3] }
      ],
      J: [
        { xMin: 1, yMin: 1, xDim: 2, yDim: 3, rows: [3, 1, 1] },
        { xMin: 0, yMin: 1, xDim: 3, yDim: 2, rows: [7, 4] },
        { xMin: 1, yMin: 0, xDim: 2, yDim: 3, rows: [2, 2, 3] },
        { xMin: 1, yMin: 1, xDim: 3, yDim: 2, rows: [1, 7] }
      ],
      T: [
        { xMin: 1, yMin: 1, xDim: 3, yDim: 2, rows: [7, 2] },
        { xMin: 1, yMin: 1, xDim: 2, yDim: 3, rows: [2, 3, 2] },
        { xMin: 0, yMin: 1, xDim: 3, yDim: 2, rows: [2, 7] },
        { xMin: 1, yMin: 0, xDim: 2, yDim: 3, rows: [1, 3, 1] }
      ]
    })
  })
})
