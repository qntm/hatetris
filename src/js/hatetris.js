/**
  HATETRIS
*/

'use strict'

import '../css/reset.css'
import '../css/hatetris.css'

import '../img/favicon.ico'

import '../html/hatetris.html'

import './statcounter'
import build from './build'
import oriGen from './ori-gen'
import getGetWorstPiece from './get-get-worst-piece'

// Fixed attributes of all of Tetris

// Note that the order here is significant,
// the least convenient piece is placed first.
const pieces = [[
  '....',
  '..##',
  '.##.',
  '....'
], [
  '....',
  '.##.',
  '..##',
  '....'
], [
  '....',
  '.##.',
  '.##.',
  '....'
], [
  '....',
  '####',
  '....',
  '....'
], [
  '....',
  '.###',
  '.#..',
  '....'
], [
  '....',
  '.##.',
  '.#..',
  '.#..'
], [
  '....',
  '.###',
  '..#.',
  '....'
]]

const orientations = oriGen(pieces)
const bar = 4
const wellDepth = 20 // min = bar
const wellWidth = 10 // min = 4
const getWorstPiece = getGetWorstPiece(orientations, bar, wellDepth, wellWidth)
const replayTimeout = 50 // milliseconds per frame

build(orientations, bar, wellDepth, wellWidth, getWorstPiece, replayTimeout)
