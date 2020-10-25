import type { Move } from './move.ts'
import * as base65536 from 'base65536'
import runLength from './../utils/run-length.ts'

const forwardEntryLookup: {
  [key in Move]: number
} = {
  L: 0b0000,
  R: 0b0100,
  D: 0b1000,
  U: 0b1100
}

const forwardLengthLookup: {
  [key: number]: number
} = {
  1: 0b0000,
  2: 0b0001,
  3: 0b0010,
  4: 0b0011
}

const reverseEntryLookup: {
  [key: number]: Move
} = {
  0b0000: 'L',
  0b0100: 'R',
  0b1000: 'D',
  0b1100: 'U'
}

const reverseNumberLookup: {
  [key: number]: number
} = {
  0b0000: 1,
  0b0001: 2,
  0b0010: 3,
  0b0011: 4
}

/**
  Convert an array of key strokes into a Uint8Array using RLE
*/
export const encode = (keys: Move[]): Uint8Array => {
  const rle = runLength.encode(keys, 0b100)

  const nybbles = rle.map(run => (
    forwardEntryLookup[run.entry] +
    forwardLengthLookup[run.length]
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

  return new Uint8Array(octets)
}

/**
  Convert an RLE'd Uint8Array back into a list of keystrokes
*/
export const decode = (uint8Array: Uint8Array): Move[] => {
  const octets = []
  for (let i = 0; i < uint8Array.length; i++) {
    octets.push(uint8Array[i])
  }

  // Extract two 4-bit numbers
  const nybbles: number[] = []
  octets.forEach(octet => {
    nybbles.push((octet & 0b11110000) >> 4)
    nybbles.push((octet & 0b00001111) >> 0)
  })

  const rle = nybbles.map(nybble => ({
    entry: reverseEntryLookup[nybble & 0b1100],
    length: reverseNumberLookup[nybble & 0b0011]
  }))

  return runLength.decode(rle)
}
