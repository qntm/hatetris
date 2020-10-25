/**
  New new Base2048 replays!
*/

import * as base2048 from 'base2048'
import type { Move } from './move.ts'
import * as uint8Array from './uint8Array.ts'

export const encode = (keys: Move[]): string =>
  base2048.encode(uint8Array.encode(keys))

export const decode = (string: string): Move[] =>
  uint8Array.decode(base2048.decode(string))
