/**
	Replay handling
*/

"use strict";

var replayHex = require("./replay-hex.js");
var replayBase65536 = require("./replay-base65536.js");

module.exports = {
	/**
		Convert an array of moves into a replay
	*/
	encode: function(moves) {
		//return replayHex.encode(moves);
		return replayBase65536.encode(moves);
	},

	/**
		Convert a string back into an array of moves
	*/
	decode: function(string) {
		if(/^[0123456789ABCDEF# ]*$/.test(string)) {
			return replayHex.decode(string);
		}
		return replayBase65536.decode(string);
	}
};
