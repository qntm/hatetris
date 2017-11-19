/**
  Generate orientations
*/

'use strict'

var dim = 4
var directions = 4
var doPiece = function (piece) {
  if (piece.length !== dim) {
    throw Error('Pieces must be ' + String(dim) + ' by ' + String(dim))
  }

  var bits = []
  piece.forEach(function (string, y) {
    if (string.length !== dim) {
      throw Error('Pieces must be ' + String(dim) + ' by ' + String(dim))
    }

    for (var x = 0; x < string.length; x++) {
      if (string.charAt(x) === '#') {
        bits.push({x: x, y: y})
      } else if (string.charAt(x) !== '.') {
        throw Error('Misconfigured pieces')
      }
    }
  })

  var layouts = []
  for (var o = 0; o < directions; o++) {
    var layout = []
    for (var y = 0; y < dim; y++) {
      var row = []
      for (var x = 0; x < dim; x++) {
        row.push(false)
      }
      layout.push(row)
    }

    bits.forEach(function (bit) {
      layout[bit.y][bit.x] = true
    })

    layouts.push(layout)

    // Rotate bits around the middle of the 4x4 grid
    bits = bits.map(function (bit) {
      return {
        x: dim - 1 - bit.y,
        y: bit.x
      }
    })
  }

  return layouts.map(function (layout) {
    var xMin = Infinity // minimum X coordinate of bits in this orientation (0, 1, 2 or 3)
    var yMin = Infinity // minimum Y coordinate of bits in this orientation (0, 1, 2 or 3)
    var xMax = -Infinity // width
    var yMax = -Infinity // height
    var rows = [] // binary representation of the bits on each row
    for (var y = 0; y < dim; y++) {
      var row = 0
      for (var x = 0; x < dim; x++) {
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
    rows = rows.slice(yMin, yMax).map(function (row) {
      return row >> xMin
    })
    var xDim = xMax - xMin
    var yDim = yMax - yMin

    return {
      xMin: xMin,
      yMin: yMin,
      xDim: xDim,
      yDim: yDim,
      rows: rows
    }
  })
}

module.exports = function (pieces) {
  return pieces.map(doPiece)
}

module.exports._doPiece = doPiece
