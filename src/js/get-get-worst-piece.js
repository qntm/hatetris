'use strict'

import getGetPossibleFutures from './get-get-possible-futures'

const searchDepth = 0 // min = 0, suggested max = 1

export default (orientations, bar, wellDepth, wellWidth) => {
  const getPossibleFutures = getGetPossibleFutures(orientations, bar, wellDepth, wellWidth)

  // deeper lines are worth less than immediate lines
  // this is so the game will never give you a line if it can avoid it
  // NOTE: make sure rating doesn't return a range of more than 100 values...
  const getWellRating = (well, highestBlue, depthRemaining) =>
    highestBlue + (depthRemaining === 0 ? 0 : getWorstPieceRating(well, highestBlue, depthRemaining - 1) / 100)

  /**
    Given a well and a piece, find the best possible location to put it.
    Return the best rating found.
  */
  const getBestWellRating = (well, highestBlue, pieceId, depthRemaining) =>
    Math.max.apply(Math, getPossibleFutures(well, highestBlue, pieceId).map(possibleFuture =>
      getWellRating(possibleFuture.well, possibleFuture.highestBlue, depthRemaining)
    ))

  const getWorstPieceDetails = (well, highestBlue, depthRemaining) =>
    Object
      .keys(orientations)
      .map(pieceId => ({
        id: pieceId,
        rating: getBestWellRating(well, highestBlue, pieceId, depthRemaining)
      }))
      .sort((a, b) => a.rating - b.rating)[0]

  // pick the worst piece that could be put into this well
  // return the rating of this piece
  // but NOT the piece itself...
  const getWorstPieceRating = (well, highestBlue, depthRemaining) =>
    getWorstPieceDetails(well, highestBlue, depthRemaining).rating

  // pick the worst piece that could be put into this well
  // return the piece but not its rating
  const getWorstPiece = (well, highestBlue) => ({
    id: getWorstPieceDetails(well, highestBlue, searchDepth).id,
    x: Math.floor((wellWidth - 4) / 2),
    y: 0,
    o: 0
  })

  return getWorstPiece
}
