'use strict'

export default (wellDepth, getWorstPiece) => {
  const well = []
  for (let row = 0; row < wellDepth; row++) {
    well.push(0)
  }

  const highestBlue = wellDepth

  return {
    well: well,
    score: 0,
    highestBlue: wellDepth,
    piece: getWorstPiece(well, highestBlue)
  }
}
