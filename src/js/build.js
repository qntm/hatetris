/**
	HATETRIS instance builder
*/

"use strict";

var firstState = require("./first-state.js");
var moves = require("./moves.js");
var nextState = require("./next-state.js");
var replay = require("./replay.js");

var minWidth = 4;

module.exports = function(orientations, bar, wellDepth, wellWidth, worstPiece, replayTimeout) {
	if(wellDepth < bar) {
		throw Error("Can't have well with depth " + String(wellDepth) + " less than bar at " + String(bar));
	}
	if(wellWidth < minWidth) {
		throw Error("Can't have well with width " + String(wellWidth) + " less than " + String(minWidth));
	}

	// Internals
	var liveState;
	var replayString = "";
	var replayOut;
	var replayIn;
	var replayTimeoutId;

	var draw = function(state, replayString) {
		var well = state.well;
		var piece = state.piece;

		// Draw the well, and the current live piece in the well if any
		for(var y = 0; y < wellDepth; y++) {
			for(var x = 0; x < wellWidth; x++) {
				var td = document.getElementById("welltbody").rows[y].cells[x];
				if(well[y] & (1 << x)) {
					td.classList.add("landed");
				} else {
					td.classList.remove("landed");
				}

				if(piece === null) {
					td.classList.remove("live");
				} else {
					var orientation = piece === null ? null : orientations[piece.id][piece.o];
					var y2 = y - piece.y - orientation.yMin;
					var x2 = x - piece.x - orientation.xMin;
					if(
						0 <= y2 && y2 < orientation.yDim
						&& 0 <= x2 && x2 < orientation.xDim
						&& (orientation.rows[y2] & (1 << x2))
					) {
						td.classList.add("live");
					} else {
						td.classList.remove("live");
					}
				}
			}
		}

		// Set the score
		document.getElementById("score").innerHTML = state.score;

		// Spit out a replay, if there is one
		var elem = document.getElementById("replayOut");
		while(elem.hasChildNodes()) {
			elem.removeChild(elem.firstChild);
		}
		if(replayString !== "") {
			elem.appendChild(document.createTextNode("replay of last game: " + replayString));
		}
	};

	// initialise all variables for a new game or replay
	var clearField = function() {

		// empty well
		// zero score
		// top blue = wellDepth = 20
		liveState = firstState(wellDepth);

		// first piece
		liveState.piece = worstPiece(liveState.well, liveState.highestBlue);

		// Don't trash the replay, though

		draw(liveState, replayString);

		// new replay
		replayOut = [];
	};

	// accepts the input of a move and attempts to apply that
	// transform to the live piece in the live well.
	// returns false if the game is over afterwards,
	// returns true otherwise
	var inputHandler = function(move) {
		liveState = nextState(orientations, bar, wellDepth, wellWidth, liveState, move);

		// update replayOut
		replayOut.push(move);

		// is the game over?
		// it is impossible to get bits at row (bar - 2) or higher without getting a bit at row (bar - 1)
		// so there is only one line which we need to check
		var gameContinues = liveState.well[bar - 1] === 0;
		if(gameContinues) {
			// no live piece? make a new one
			// suited to the new world, of course
			if(liveState.piece === null) {
				liveState.piece = worstPiece(liveState.well, liveState.highestBlue);
			}
		} else {
			// GAME OVER STUFF:
			replayString = replay.encode(replayOut);
		}

		draw(liveState, replayString);

		return gameContinues;
	};

	var inputKey = function(event) {

		// only handle one key at a time.
		// if another key may be pressed,
		// this will be reactivated later
		document.onkeydown = null;
		event = event || window.event; // add for IE
		var move = null;

		switch(event.keyCode) {
			case 37: move = "L"; break;
			case 39: move = "R"; break;
			case 40: move = "D"; break;
			case 38: move = "U"; break;
			default: document.onkeydown = inputKey; return;
		}

		// make that move
		// move is sanitised
		var gameContinues = inputHandler(move);

		// optionally: continue the game
		if(gameContinues) {
			document.onkeydown = inputKey;
		}
	};

	// this has to be done recursively, sigh
	var inputReplayStep = function() {
		var move = replayIn.shift();

		// ignore non-replay characters
		// so that move is sanitised
		while(moves.indexOf(move) === -1 && replayIn.length > 0) {
			move = replayIn.shift();
		}

		// make that move
		// move is sanitised
		var gameContinues = inputHandler(move);

		// optionally: continue the game
		if(gameContinues) {
			// if there is still replay left, time in another step from the replay
			// otherwise, allow the user to continue the game
			if(replayIn.length > 0) {
				replayTimeoutId = setTimeout(inputReplayStep, replayTimeout);
			} else {
				document.onkeydown = inputKey;
			}
		}
	};

	// clear the field and get ready for a new game
	var startGame = function() {

		// there may be a replay in progress, this
		// must be killed
		clearTimeout(replayTimeoutId);

		clearField();

		// prepare to take user input
		document.onkeydown = inputKey;
	};

	var startReplay = function() {

		// there may be a replay in progress, this
		// must be killed
		clearTimeout(replayTimeoutId);

		// disable user input while showing a replay
		document.onkeydown = null;

		// user inputs replay string
		var string = prompt() || ""; // change for IE
		replayIn = replay.decode(string);

		// GO
		clearField();

		// line up first step (will trigger own later steps)
		inputReplayStep();
	};

	/**
		This function performs initial draw.
	*/
	(function() {
		// create playing field
		var tbody = document.getElementById("welltbody");
		for(var y = 0; y < wellDepth; y++) {
			var tr = document.createElement("tr");
			tbody.appendChild(tr);
			for(var x = 0; x < wellWidth; x++) {
				var td = document.createElement("td");
				td.classList.add("cell");
				if(y === bar) {
					td.classList.add("bar");
				}
				tr.appendChild(td);
			}
		}

		// put some buttons on the playing field
		var buttons = [
			{y: 0, x: 1, move: "U", symbol: "\u27F3"},
			{y: 1, x: 0, move: "L", symbol: "\u2190"},
			{y: 1, x: 1, move: "D", symbol: "\u2193"},
			{y: 1, x: 2, move: "R", symbol: "\u2192"}
		];
		buttons.forEach(function(button) {
			var td = tbody.rows[button.y].cells[button.x];
			td.appendChild(document.createTextNode(button.symbol));
			td.addEventListener("click", function() {
				inputHandler(button.move);
			});
			td.classList.add("manual");
		});
		document.getElementById("start").addEventListener("click", startGame);
		document.getElementById("replay").addEventListener("click", startReplay);
	})();
};
