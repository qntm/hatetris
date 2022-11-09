/**
  Replay handling. This codec is a combination of three other codecs
*/

import hex from './hex'
import * as base65536 from './base65536'
import * as base2048 from './base2048'

/**
  Convert an array of moves into a replay
*/
// const encode = (moves: string[]): string => hex.encode(moves)
// const encode = (moves: string[]): string => base65536.encode(moves)
const encode = (moves: string[]): string => base2048.encode(moves)

/**
  Convert a string back into an array of moves
*/
const decode = (string: string): string[] => {
  string = string.trim()

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
