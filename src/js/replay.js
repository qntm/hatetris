/**
  Replay handling
*/

'use strict'

import replayHex from './replay-hex'
import replayBase65536 from './replay-base65536'
import replayBase2048 from './replay-base2048'

/**
  Convert an array of moves into a replay
*/
// const encode = moves => replayHex.encode(moves)
// const encode = moves => replayBase65536.encode(moves)
const encode = moves => replayBase2048.encode(moves)

/**
  Convert a string back into an array of moves
*/
const decode = string => {
  if (/^[0123456789ABCDEF# ]*$/.test(string)) {
    return replayHex.decode(string)
  }
  try {
    return replayBase65536.decode(string)
  } catch (e) {
  }
  return replayBase2048.decode(string)
}

export default {encode, decode}
