/**
  Old hex-mode replays.
*/

'use strict'

module.exports = {
  /**
    Convert an array of moves into a replay
  */
  encode: function (moves) {
    // Replays must have an even number of moves in order
    // for the encoding to work correctly
    if (moves.length % 2 === 1) {
      moves.push('D')
    }

    var movePairs = []
    var movePair = ''
    moves.forEach(function (move) {
      movePair += move
      if (movePair.length === 2) {
        movePairs.push(movePair)
        movePair = ''
      }
    })

    var string = movePairs.map(function (movePair) {
      if (movePair === 'LL') { return '0' }
      if (movePair === 'LR') { return '1' }
      if (movePair === 'LD') { return '2' }
      if (movePair === 'LU') { return '3' }
      if (movePair === 'RL') { return '4' }
      if (movePair === 'RR') { return '5' }
      if (movePair === 'RD') { return '6' }
      if (movePair === 'RU') { return '7' }
      if (movePair === 'DL') { return '8' }
      if (movePair === 'DR') { return '9' }
      if (movePair === 'DD') { return 'A' }
      if (movePair === 'DU') { return 'B' }
      if (movePair === 'UL') { return 'C' }
      if (movePair === 'UR') { return 'D' }
      if (movePair === 'UD') { return 'E' }
      if (movePair === 'UU') { return 'F' }
      throw Error('Unrecognised move pair: ' + movePair)
    })

    // add a space every 4 characters
    string = string.replace(/(....)/g, '$1 ')
    return string
  },

  /**
    Convert a string back into an array of moves
  */
  decode: function (string) {
    var moves = []
    string.split('').forEach(function (chr) {
      if (chr === '0') { moves.push('L', 'L') }
      if (chr === '1') { moves.push('L', 'R') }
      if (chr === '2') { moves.push('L', 'D') }
      if (chr === '3') { moves.push('L', 'U') }
      if (chr === '4') { moves.push('R', 'L') }
      if (chr === '5') { moves.push('R', 'R') }
      if (chr === '6') { moves.push('R', 'D') }
      if (chr === '7') { moves.push('R', 'U') }
      if (chr === '8') { moves.push('D', 'L') }
      if (chr === '9') { moves.push('D', 'R') }
      if (chr === 'A') { moves.push('D', 'D') }
      if (chr === 'B') { moves.push('D', 'U') }
      if (chr === 'C') { moves.push('U', 'L') }
      if (chr === 'D') { moves.push('U', 'R') }
      if (chr === 'E') { moves.push('U', 'D') }
      if (chr === 'F') { moves.push('U', 'U') }
      // Ignore others
    })
    return moves
  }
}
