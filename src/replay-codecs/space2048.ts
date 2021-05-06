/**
  Base2048 but with zero-width spaces to encourage wrapping
*/

import * as base2048 from './base2048'

const zeroWidthSpace = '\u200B'

export const encode = (keys: string[]): string =>
  base2048.encode(keys).split('').join(zeroWidthSpace)

export const decode = (string: string): string[] =>
  base2048.decode(string.replace(new RegExp(zeroWidthSpace, 'g'), ''))
