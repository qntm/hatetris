/**
  New new Base2048 replays!
*/

'use strict'

import * as base2048 from 'base2048'
import runLength from './../run-length'

/**
  Convert an array of key strokes into a replay
*/
const encode = keys => {
  const rle = runLength.encode(keys, 0b100)

  const nybbles = rle.map(run => (
    { L: 0b0000, R: 0b0100, D: 0b1000, U: 0b1100 }[run.entry] +
    (0b0011 & (run.length - 1))
  ))

  // Can't have an odd number of nybbles. This would break in mid-byte!
  // This is an extra 'L' on the end
  if (nybbles.length % 2 === 1) {
    nybbles.push(0b0000)
  }

  const octets = []
  for (let i = 0; i < nybbles.length; i += 2) {
    octets.push(
      (nybbles[i] << 4) +
      (nybbles[i + 1] << 0)
    )
  }

  const uint8Array = new Uint8Array(octets)

  return base2048.encode(uint8Array)
}

/**
  Convert a Base2048 string back into a list of keystrokes
*/
const decode = string => {
  const uint8Array = base2048.decode(string)

  const octets = []
  for (let i = 0; i < uint8Array.length; i++) {
    octets.push(uint8Array[i])
  }

  // Extract two 4-bit numbers
  const nybbles = []
  octets.forEach(octet => {
    nybbles.push((octet & 0b11110000) >> 4)
    nybbles.push((octet & 0b00001111) >> 0)
  })

  const rle = nybbles.map(nybble => ({
    entry: {
      0b0000: 'L',
      0b0100: 'R',
      0b1000: 'D',
      0b1100: 'U'
    }[nybble & 0b1100],
    length: (nybble & 0b0011) + 1
  }))

  return runLength.decode(rle)
}

export default { encode, decode }
