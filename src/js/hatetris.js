/**
	HATETRIS
*/

"use strict";

var build = require("./build.js");
var oriGen = require("./ori-gen.js");
var getGetWorstPiece = require("./get-get-worst-piece.js");

// Fixed attributes of all of Tetris

// Note that the order here is significant,
// the least convenient piece is placed first.
var pieces = [[
	"....",
	"..##",
	".##.",
	"...."
], [
	"....",
	".##.",
	"..##",
	"...."
], [
	"....",
	".##.",
	".##.",
	"...."
], [
	"....",
	"####",
	"....",
	"...."
], [
	"....",
	".###",
	".#..",
	"...."
], [
	"....",
	".##.",
	".#..",
	".#.."
], [
	"....",
	".###",
	"..#.",
	"...."
]];

var orientations = oriGen(pieces);
var bar = 4;
var wellDepth = 20; // min = bar
var wellWidth = 10; // min = 4
var getWorstPiece = getGetWorstPiece(orientations, bar, wellDepth, wellWidth);
var replayTimeout = 50; // milliseconds per frame

build(orientations, bar, wellDepth, wellWidth, getWorstPiece, replayTimeout);
