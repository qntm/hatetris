/**
  Replay handling
*/

'use strict'

import hex from './replay-codecs/hex'
import base65536 from './replay-codecs/base65536'
import base2048 from './replay-codecs/base2048'

/**
  Convert an array of moves into a replay
*/
// const encode = moves => hex.encode(moves)
// const encode = moves => base65536.encode(moves)
const encode = moves => base2048.encode(moves)

/**
  Convert a string back into an array of moves
*/
const decode = string => {
  if (/^[0123456789ABCDEF# ]*$/.test(string)) {
    return hex.decode(string)
  }

  try {
    return base65536.decode(string)
  } catch (e) {
    // not Base65536
  }

  return base2048.decode(string)
}

export default { encode, decode }
