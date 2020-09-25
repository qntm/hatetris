/**
  Old hex-mode replays.
*/

'use strict'

/**
  Convert an array of moves into a replay
*/
const encode = moves => moves
  .join('')
  .replace(/..?/g, chrs => ({
    LL: '0',
    LR: '1',
    LD: '2',
    LU: '3',
    RL: '4',
    RR: '5',
    RD: '6',
    RU: '7',
    DL: '8',
    DR: '9',
    DD: 'A',
    DU: 'B',
    UL: 'C',
    UR: 'D',
    UD: 'E',
    UU: 'F',

    // trailing unpaired move behaves as if an extra "D" was appended
    L: '2',
    R: '6',
    D: 'A',
    U: 'E'
  }[chrs]))
  .replace(/(....)/g, '$1 ')

/**
  Convert a string back into an array of moves
*/
const decode = string => string
  .replace(/./g, chr => ({
    [chr]: '', // Ignore others including spaces
    0: 'LL',
    1: 'LR',
    2: 'LD',
    3: 'LU',
    4: 'RL',
    5: 'RR',
    6: 'RD',
    7: 'RU',
    8: 'DL',
    9: 'DR',
    A: 'DD',
    B: 'DU',
    C: 'UL',
    D: 'UR',
    E: 'UD',
    F: 'UU'
  }[chr]))
  .split('')

export default { encode, decode }
