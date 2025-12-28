/**
  New new Base2048 replays!
*/

import * as base2048 from 'base2048'
import * as uint8Array from './uint8Array.ts'

export const encode = (keys: string[]): string =>
  base2048.encode(uint8Array.encode(keys))

export const decode = (string: string): string[] =>
  uint8Array.decode(base2048.decode(string))
