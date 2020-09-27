/**
  Replay handling. This codec is a combination of three other codecs
*/

'use strict'

import hex from './hex'
import base65536 from './base65536'
import base2048 from './base2048'

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
    // not Base65536, no problem
  }

  return base2048.decode(string)
}

export default { encode, decode }
