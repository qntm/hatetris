'use strict'

export default (wellDepth, placeFirstPiece, enemyAi) => {
  const well = []
  for (let row = 0; row < wellDepth; row++) {
    well.push(0)
  }

  return {
    well: well,
    score: 0,
    piece: placeFirstPiece(enemyAi(well))
  }
}
