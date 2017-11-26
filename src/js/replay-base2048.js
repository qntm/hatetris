/**
  New new Base2048 replays!
*/

'use strict'

import base2048 from 'base2048'
import runLength from './run-length'

/**
  Convert an array of key strokes into a replay
*/
const encode = keys => {
  let rle = runLength.encode(keys, 4)

  // Can't have an odd number of runs. This would break in mid-byte!
  if (rle.length % 2 === 1) {
    rle.push({entry: 'L', length: 1})
  }

  rle = rle.map(run => ({
    key: {
      L: 0,
      R: 1,
      D: 2,
      U: 3
    }[run.entry],
    rl: run.length - 1
  }))

  rle = rle.map(run => (run.key << 2) + run.rl)

  const octets = []
  for (let i = 0; i < rle.length; i += 2) {
    octets.push((rle[i] << 4) + rle[i + 1])
  }

  const uint8Array = new Uint8Array(octets)

  return base2048.encode(uint8Array.buffer)
}

/**
  Convert a Base2048 string back into a list of keystrokes
*/
const decode = string => {
  const uint8Array = new Uint8Array(base2048.decode(string))

  const octets = []
  for (let i = 0; i < uint8Array.length; i++) {
    octets.push(uint8Array[i])
  }

  let rle = []
  octets.forEach(octet => {
    rle.push(octet >> 4)
    rle.push(octet & ((1 << 4) - 1))
  })

  rle = rle.map(run => ({
    key: run >> 2,
    rl: run & ((1 << 2) - 1)
  }))

  rle = rle.map(run => ({
    entry: {
      0: 'L',
      1: 'R',
      2: 'D',
      3: 'U'
    }[run.key],
    length: run.rl + 1
  }))

  return runLength.decode(rle)
}

export default {encode, decode}
