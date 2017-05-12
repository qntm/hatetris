/**
	New Base65536 replays.
*/

"use strict";

var base65536 = require("base65536");

module.exports = {
	/**
		Convert an array of key strokes into a replay
	*/
	encode: function(keys) {

		var rle = [];
		var current = null;
		keys.forEach(function(key) {
			if(
				rle.length > 0 &&
				rle[rle.length - 1].key === key &&
				rle[rle.length - 1].rl < 4
			) {
				rle[rle.length - 1].rl++;
			} else {
				rle.push({key: key, rl: 1});
			}
		});

		// Can't have an odd number of runs. This would break in mid-byte!
		if(rle.length % 2 === 1) {
			rle.push({key: "L", rl: 1});
		}

		rle = rle.map(function(run) {
			return {
				key: {
					L: 0,
					R: 1,
					D: 2,
					U: 3
				}[run.key],
				rl: run.rl - 1
			};
		});
		rle = rle.map(function(run) {
			return (run.key << 2) + run.rl;
		});

		var octets = [];
		for(var i = 0; i < rle.length; i += 2) {
			octets.push((rle[i] << 4) + rle[i + 1]);
		}

		return base65536.encode(octets);
	},

	/**
		Convert a Base65536 string back into a list of keystrokes
	*/
	decode: function(string) {
		var octets = base65536.decode(string);
		var rle = [];
		octets.forEach(function(octet) {
			rle.push(octet >> 4);
			rle.push(octet & ((1 << 4) - 1));
		});

		rle = rle.map(function(run) {
			return {
				key: run >> 2,
				rl: run & ((1 << 2) - 1)
			};
		});

		rle = rle.map(function(run) {
			return {
				key: {
					0: "L",
					1: "R",
					2: "D",
					3: "U"
				}[run.key],
				rl: run.rl + 1
			};
		});

		var moves = [];
		rle.forEach(function(run) {
			for(var j = 0; j < run.rl; j++) {
				moves.push(run.key);
			}
		});
		return moves;
	}
};
