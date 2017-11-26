/**
  Generate orientations
*/

'use strict'

const dim = 4
const directions = 4

export function _doPiece (piece) {
  if (piece.length !== dim) {
    throw Error('Pieces must be ' + String(dim) + ' by ' + String(dim))
  }

  let bits = []
  piece.forEach((string, y) => {
    if (string.length !== dim) {
      throw Error('Pieces must be ' + String(dim) + ' by ' + String(dim))
    }

    for (let x = 0; x < string.length; x++) {
      if (string.charAt(x) === '#') {
        bits.push({x: x, y: y})
      } else if (string.charAt(x) !== '.') {
        throw Error('Misconfigured pieces')
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
          if (x < xMin) {
            xMin = x
          }
          if (x > xMax) {
            xMax = x
          }
          if (y < yMin) {
            yMin = y
          }
          if (y > yMax) {
            yMax = y
          }
        }
      }
      rows[y] = row
    }
    xMax++
    yMax++

    // truncate top rows
    // truncate bottom rows
    // shift right as many times as necessary
    rows = rows.slice(yMin, yMax).map(row => row >> xMin)
    const xDim = xMax - xMin
    const yDim = yMax - yMin

    return {
      xMin: xMin,
      yMin: yMin,
      xDim: xDim,
      yDim: yDim,
      rows: rows
    }
  })
}

export default pieces => pieces.map(_doPiece)
