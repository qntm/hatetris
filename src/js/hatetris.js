/**
	HATETRIS
*/

"use strict";

var build = require("./build.js");

var bar = 4;
var wellDepth = 20; // min = bar
var wellWidth = 10; // min = 4
var searchDepth = 0; // min = 0, suggested max = 1
var replayTimeout = 50; // milliseconds per frame

build(bar, wellDepth, wellWidth, searchDepth, replayTimeout);
