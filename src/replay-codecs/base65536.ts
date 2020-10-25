/**
  New Base65536 replays.
*/

import * as base65536 from 'base65536'
import type { Move } from './move.ts'
import * as uint8Array from './uint8Array.ts'

export const encode = (keys: Move[]): string => 
  base65536.encode(uint8Array.encode(keys))

export const decode = (string: string): Move[] =>
  uint8Array.decode(base65536.decode(string))
