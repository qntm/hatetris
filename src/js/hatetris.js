/**
	HATETRIS
*/

"use strict";

var build = require("./build.js");
var oriGen = require("./ori-gen.js");
var worstPieceFactory = require("./worst-piece-factory.js");

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
var worstPiece = worstPieceFactory(orientations, bar, wellDepth, wellWidth);
var replayTimeout = 50; // milliseconds per frame

build(orientations, bar, wellDepth, wellWidth, worstPiece, replayTimeout);
