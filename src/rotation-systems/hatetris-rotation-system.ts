/**
  The HATETRIS rotation system
*/

const unmodified = {
  I: [
    [
      '....',
      '####',
      '....',
      '....'
    ], [
      '..#.',
      '..#.',
      '..#.',
      '..#.'
    ], [
      '....',
      '....',
      '####',
      '....'
    ], [
      '.#..',
      '.#..',
      '.#..',
      '.#..'
    ]
  ],

  J: [
    [
      '....',
      '.##.',
      '.#..',
      '.#..'
    ], [
      '....',
      '###.',
      '..#.',
      '....'
    ], [
      '..#.',
      '..#.',
      '.##.',
      '....'
    ], [
      '....',
      '.#..',
      '.###',
      '....'
    ]
  ],

  L: [
    [
      '....',
      '.###',
      '.#..',
      '....'
    ], [
      '....',
      '.##.',
      '..#.',
      '..#.'
    ], [
      '....',
      '..#.',
      '###.',
      '....'
    ], [
      '.#..',
      '.#..',
      '.##.',
      '....'
    ]
  ],

  O: [
    [
      '....',
      '.##.',
      '.##.',
      '....'
    ], [
      '....',
      '.##.',
      '.##.',
      '....'
    ], [
      '....',
      '.##.',
      '.##.',
      '....'
    ], [
      '....',
      '.##.',
      '.##.',
      '....'
    ]
  ],

  S: [
    [
      '....',
      '..##',
      '.##.',
      '....'
    ], [
      '....',
      '.#..',
      '.##.',
      '..#.'
    ], [
      '....',
      '.##.',
      '##..',
      '....'
    ], [
      '.#..',
      '.##.',
      '..#.',
      '....'
    ]
  ],

  T: [
    [
      '....',
      '.###',
      '..#.',
      '....'
    ], [
      '....',
      '..#.',
      '.##.',
      '..#.'
    ], [
      '....',
      '.#..',
      '###.',
      '....'
    ], [
      '.#..',
      '.##.',
      '.#..',
      '....'
    ]
  ],

  Z: [
    [
      '....',
      '.##.',
      '..##',
      '....'
    ], [
      '....',
      '..#.',
      '.##.',
      '.#..'
    ], [
      '....',
      '##..',
      '.##.',
      '....'
    ], [
      '..#.',
      '.##.',
      '.#..',
      '....'
    ]
  ]
}

// Note that the order here is significant,
// the least convenient piece is placed first.
const rotations = Object.fromEntries(
  Object.entries(unmodified)
    .map(([
      pieceId,
      visuals
    ]) => [
      pieceId,
      visuals
        .map(visual => {
          let xMin = Infinity // leftmost extent (0, 1, 2 or 3)
          let xMax = -Infinity // rightmost extent (1, 2, 3 or 4)
          let yMin = Infinity // topmost extent (0, 1, 2 or 3)
          let yMax = -Infinity // bottommost extent (1, 2, 3 or 4)

          // binary representation of the bits on each row
          const allRows = visual.map((visualRow, y) => {
            let row = 0
            visualRow.split('').forEach((chr, x) => {
              if (chr === '#') {
                row += 1 << x
                xMin = Math.min(xMin, x)
                xMax = Math.max(xMax, x + 1)
                yMin = Math.min(yMin, y)
                yMax = Math.max(yMax, y + 1)
              }
            })
            return row
          })

          // truncate top rows
          // truncate bottom rows
          // shift right as many times as necessary
          const rows = allRows.slice(yMin, yMax).map(row => row >> xMin)

          return {
            xMin,
            yMin,
            xDim: xMax - xMin,
            yDim: yMax - yMin,
            rows
          }
        })
    ])
)

const placeNewPiece = (wellWidth: number, pieceId: string) => ({
  id: pieceId,
  x: Math.floor((wellWidth - 4) / 2),
  y: 0,
  o: 0
})

export default {
  placeNewPiece,
  rotations
}
