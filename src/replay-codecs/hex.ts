/**
  Old hex-mode replays.
*/

'use strict'

import { moves } from './move.ts'

const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']

const forwardLookup: {
  [key: string]: {
    [key: string]: string
  }
}= {
  L: { L: '0', R: '1', D: '2', U: '3' },
  R: { L: '4', R: '5', D: '6', U: '7' },
  D: { L: '8', R: '9', D: 'A', U: 'B' },
  U: { L: 'C', R: 'D', D: 'E', U: 'F' }
}

const reverseLookup: {
  [key: string]: [string, string]
} = {
  0: ['L', 'L'],
  1: ['L', 'R'],
  2: ['L', 'D'],
  3: ['L', 'U'],
  4: ['R', 'L'],
  5: ['R', 'R'],
  6: ['R', 'D'],
  7: ['R', 'U'],
  8: ['D', 'L'],
  9: ['D', 'R'],
  A: ['D', 'D'],
  B: ['D', 'U'],
  C: ['U', 'L'],
  D: ['U', 'R'],
  E: ['U', 'D'],
  F: ['U', 'U']
}

/**
  Convert an array of moves into a replay
*/
const encode = (inputMoves: string[]): string => inputMoves
  .map((move1, i) => {
    if (i % 2 === 1) {
      return ''
    }

    // trailing unpaired move behaves as if an extra "D" was appended
    const move2 = i + 1 in inputMoves ? inputMoves[i + 1] : 'D'

    const x = forwardLookup[move1] || {}
    return x[move2] || ''
  })
  .join('')
  .replace(/(....)/g, '$1 ')

/**
  Convert a string back into an array of moves
*/
const decode = (string: string): string[] => string
  .split('')
  .map(chr => hexChars.includes(chr) ? reverseLookup[chr] : [])
  .flat()

export default { encode, decode }
