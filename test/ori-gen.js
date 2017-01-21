"use strict";

var oriGen = require("../src/ori-gen.js");
var deepEqual = require("deep-equal");

console.log(deepEqual(oriGen._doPiece({
	id: "S",
	bits: [
		{x: 1, y: 2},
		{x: 2, y: 1},
		{x: 2, y: 2},
		{x: 3, y: 1}
	]
}), [
	{xMin: 1, yMin: 1, xDim: 3, yDim: 2, rows: [6, 3]},
	{xMin: 1, yMin: 1, xDim: 2, yDim: 3, rows: [1, 3, 2]},
	{xMin: 0, yMin: 1, xDim: 3, yDim: 2, rows: [6, 3]},
	{xMin: 1, yMin: 0, xDim: 2, yDim: 3, rows: [1, 3, 2]}
]));
