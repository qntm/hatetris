'use strict'

module.exports = function (wellDepth, getWorstPiece) {
  var well = []
  for (var row = 0; row < wellDepth; row++) {
    well.push(0)
  }

  var highestBlue = wellDepth

  return {
    well: well,
    score: 0,
    highestBlue: wellDepth,
    piece: getWorstPiece(well, highestBlue)
  }
}
