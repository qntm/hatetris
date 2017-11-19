'use strict'

var getGetNextState = require('./get-get-next-state.js')
var moves = require('./moves.js')

module.exports = function (orientations, bar, wellDepth, wellWidth) {
  var getNextState = getGetNextState(orientations, bar, wellDepth, wellWidth)

  /**
    Given a well and a piece, find all possible places where it could land
    and return the array of "possible future" states. All of these states
    will have `null` `piece` because the piece is landed; some will have
    a different `highestBlue`; some will have an increase `score`.
  */
  return function (well, highestBlue, pieceId) {
    /**
      Generate a unique integer to describe the position and orientation of this piece.
      `x` varies between -3 and (`wellWidth` - 1) inclusive, so range = `wellWidth` + 3
      `y` varies between 0 and (`wellDepth` + 2) inclusive, so range = `wellDepth` + 3
      `o` varies between 0 and 3 inclusive, so range = 4
    */
    function hashCode (x, y, o) {
      return (x * (wellDepth + 3) + y) * 4 + o
    }

    var piece = {
      id: pieceId,
      x: 0,
      y: 0,
      o: 0
    }

    // move the piece down to a lower position before we have to
    // start pathfinding for it
    // move through empty rows
    while (
      piece.y + 4 < wellDepth && // piece is above the bottom
      well[piece.y + 4] === 0 // nothing immediately below it
    ) {
      piece = getNextState({
        well: well,
        score: 0,
        highestBlue: 0,
        piece: piece
      }, 'D').piece
    }

    // push first position
    var piecePositions = [piece]

    var seen = []
    seen[hashCode(piece.x, piece.y, piece.o)] = 1

    var possibleFutures = []

    // a simple for loop won't work here because
    // we are increasing the list as we go
    var i = 0
    while (i < piecePositions.length) {
      piece = piecePositions[i]

      // apply all possible moves
      moves.forEach(function (move) {
        var nextState = getNextState({
          well: well,
          score: 0,
          highestBlue: highestBlue,
          piece: piece
        }, move)
        var newPiece = nextState.piece

        // transformation failed?
        if (newPiece === null) {
          // piece locked? better add that to the list
          // do NOT check locations, they aren't significant here
          if (move === 'D') {
            possibleFutures.push(nextState)
          }
        } else {
          // transform succeeded?
          // new location? append to list
          // check locations, they are significant
          var newHashCode = hashCode(newPiece.x, newPiece.y, newPiece.o)

          if (seen[newHashCode] === undefined) {
            piecePositions.push(newPiece)
            seen[newHashCode] = 1
          }
        }
      })
      i++
    }

    return possibleFutures
  }
}
