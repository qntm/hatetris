/**
  The HATETRIS rotation system
*/

'use strict'

const dim = 4
const directions = 4

export function _doPiece (piece) {
  let bits = []
  piece.forEach((string, y) => {
    for (let x = 0; x < string.length; x++) {
      if (string.charAt(x) === '#') {
        bits.push({ x, y })
      }
    }
  })

  const layouts = []
  for (let o = 0; o < directions; o++) {
    const layout = []
    for (let y = 0; y < dim; y++) {
      const row = []
      for (let x = 0; x < dim; x++) {
        row.push(false)
      }
      layout.push(row)
    }

    bits.forEach(bit => {
      layout[bit.y][bit.x] = true
    })

    layouts.push(layout)

    // Rotate bits around the middle of the 4x4 grid
    bits = bits.map(bit => ({
      x: dim - 1 - bit.y,
      y: bit.x
    }))
  }

  return layouts.map(layout => {
    let xMin = Infinity // minimum X coordinate of bits in this orientation (0, 1, 2 or 3)
    let yMin = Infinity // minimum Y coordinate of bits in this orientation (0, 1, 2 or 3)
    let xMax = -Infinity // width
    let yMax = -Infinity // height
    let rows = [] // binary representation of the bits on each row
    for (let y = 0; y < dim; y++) {
      let row = 0
      for (let x = 0; x < dim; x++) {
        if (layout[y][x]) {
          row += 1 << x
          xMin = Math.min(xMin, x)
          xMax = Math.max(xMax, x + 1)
          yMin = Math.min(yMin, y)
          yMax = Math.max(yMax, y + 1)
        }
      }
      rows[y] = row
    }

    // truncate top rows
    // truncate bottom rows
    // shift right as many times as necessary
    rows = rows.slice(yMin, yMax).map(row => row >> xMin)

    return {
      xMin,
      yMin,
      xDim: xMax - xMin,
      yDim: yMax - yMin,
      rows
    }
  })
}

// Note that the order here is significant,
// the least convenient piece is placed first.
const rotations = [[
  '....',
  '..##',
  '.##.',
  '....'
], [
  '....',
  '.##.',
  '..##',
  '....'
], [
  '....',
  '.##.',
  '.##.',
  '....'
], [
  '....',
  '####',
  '....',
  '....'
], [
  '....',
  '.###',
  '.#..',
  '....'
], [
  '....',
  '.##.',
  '.#..',
  '.#..'
], [
  '....',
  '.###',
  '..#.',
  '....'
]].map(_doPiece)

const placeNewPiece = (wellWidth, pieceId) => ({
  id: pieceId,
  x: Math.floor((wellWidth - 4) / 2),
  y: 0,
  o: 0
})

export default {
  placeNewPiece,
  rotations
}
