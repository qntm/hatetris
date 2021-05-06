/**
  New Base65536 replays.
*/

import * as base65536 from 'base65536'
import * as uint8Array from './uint8Array'

export const encode = (keys: string[]): string =>
  base65536.encode(uint8Array.encode(keys))

export const decode = (string: string): string[] =>
  uint8Array.decode(base65536.decode(string))
