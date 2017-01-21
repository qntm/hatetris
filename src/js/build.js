/**
	HATETRIS instance builder
*/

"use strict";

var oriGen = require("./ori-gen.js");
var replay = require("./replay.js");

var minWidth = 4;

// Fixed attributes of all of Tetris

// Note that the order here is significant,
// the least convenient piece is placed first.
var pieces = [
	{
		id: "S",
		bits: [
			{x: 1, y: 2},
			{x: 2, y: 1},
			{x: 2, y: 2},
			{x: 3, y: 1}
		]
	},
	{
		id: "Z",
		bits: [
			{x: 1, y: 1},
			{x: 2, y: 1},
			{x: 2, y: 2},
			{x: 3, y: 2}
		]
	},
	{
		id: "O",
		bits: [
			{x: 1, y: 1},
			{x: 1, y: 2},
			{x: 2, y: 1},
			{x: 2, y: 2}
		]
	},
	{
		id: "I",
		bits: [
			{x: 0, y: 1},
			{x: 1, y: 1},
			{x: 2, y: 1},
			{x: 3, y: 1}
		]
	},
	{
		id: "L",
		bits: [
			{x: 1, y: 1},
			{x: 1, y: 2},
			{x: 2, y: 1},
			{x: 3, y: 1}
		]
	},
	{
		id: "J",
		bits: [
			{x: 1, y: 1},
			{x: 1, y: 2},
			{x: 1, y: 3},
			{x: 2, y: 1}
		]
	},
	{
		id: "T",
		bits: [
			{x: 1, y: 1},
			{x: 2, y: 1},
			{x: 2, y: 2},
			{x: 3, y: 1}
		]
	}
];
var pieceIds = pieces.map(function(piece) {
	return piece.id;
});
var moves = ["L", "R", "D", "U"];
var orientations = oriGen(pieces);

module.exports = function(bar, wellDepth, wellWidth, searchDepth, replayTimeout) {
	if(wellDepth < bar) {
		throw Error("Can't have well with depth " + String(wellDepth) + " less than bar at " + String(bar));
	}
	if(wellWidth < minWidth) {
		throw Error("Can't have well with width " + String(wellWidth) + " less than " + String(minWidth));
	}

	// Internals
	var liveState = {
		well: [],
		score: 0,
		highestBlue: wellDepth,
		piece: null
	};
	var replayString = "";
	var replayOut;
	var replayIn;
	var replayTimeoutId;

	/**
		Input {well, score, highestBlue, piece} and a move, return
		the new {well, score, highestBlue, piece}.
	*/
	var nextState = function(state, move) {
		var nextWell = state.well;
		var nextScore = state.score;
		var nextHighestBlue = state.highestBlue;
		var nextPiece = {
			id : state.piece.id,
			x  : state.piece.x,
			y  : state.piece.y,
			o  : state.piece.o
		};

		// apply transform (very fast now)
		if(move === "L") {
			nextPiece.x--;
		}
		if(move === "R") {
			nextPiece.x++;
		}
		if(move === "D") {
			nextPiece.y++;
		}
		if(move === "U") {
			nextPiece.o = (nextPiece.o + 1) % 4;
		}

		var orientation = orientations[nextPiece.id][nextPiece.o];
		var xActual = nextPiece.x + orientation.xMin;
		var yActual = nextPiece.y + orientation.yMin;

		if(
			   xActual < 0                            // off left side
			|| xActual + orientation.xDim > wellWidth // off right side
			|| yActual < 0                            // off top (??)
			|| yActual + orientation.yDim > wellDepth // off bottom
			|| orientation.rows.some(function(row, y) {
				return state.well[yActual + y] & (row << xActual);
			}) // obstruction
		) {
			if(move === "D") {
				// Lock piece
				nextWell = state.well.slice();

				var orientation = orientations[state.piece.id][state.piece.o];

				// this is the top left point in the bounding box of this orientation of this piece
				var xActual = state.piece.x + orientation.xMin;
				var yActual = state.piece.y + orientation.yMin;

				// update the "highestBlue" value to account for newly-placed piece
				nextHighestBlue = Math.min(nextHighestBlue, yActual);

				// row by row bitwise line alteration
				// because we do this from the top down, we can remove lines as we go
				for(var row = 0; row < orientation.yDim; row++ ) {
					// can't negative bit-shift, but alas X can be negative
					nextWell[yActual + row] |= (orientation.rows[row] << xActual);

					// check for a complete line now
					// NOTE: completed lines don't count if you've lost
					if(
						   yActual >= bar
						&& nextWell[yActual + row] === (1 << wellWidth) - 1
					) {
						// move all lines above this point down
						for(var k = yActual + row; k > 1; k--) {
							nextWell[k] = nextWell[k - 1];
						}

						// insert a new blank line at the top
						// though of course the top line will always be blank anyway
						nextWell[0] = 0;

						nextScore++;
						nextHighestBlue++;
					}
				}
				nextPiece = null;
			}

			// No move
			else {
				nextPiece = state.piece;
			}
		}

		return {
			well: nextWell,
			score: nextScore,
			highestBlue: nextHighestBlue,
			piece: nextPiece
		};
	};

	/**
		Given a well and a piece, find the best possible location to put it.
		Return the best rating found.
	*/
	function bestWellRating(well, highestBlue, pieceId, d) {
		/**
			Generate a unique integer to describe the position and orientation of this piece.
			`x` varies between -3 and (`wellWidth` - 1) inclusive, so range = `wellWidth` + 3
			`y` varies between 0 and (`wellDepth` + 2) inclusive, so range = `wellDepth` + 3
			`o` varies between 0 and 3 inclusive, so range = 4
		*/
		function hashCode(x, y, o) {
			return (x * (wellDepth + 3) + y) * 4 + o;
		}

		var piece = {
			id : pieceId,
			x  : 0,
			y  : 0,
			o  : 0
		};

		// iterate over all possible resulting positions and get
		// best rating
		var bestRating = null;

		// move the piece down to a lower position before we have to
		// start pathfinding for it
		// move through empty rows
		while(
			   piece.y + 4 < wellDepth // piece is above the bottom
			&& well[piece.y + 4] === 0 // nothing immediately below it
		) {
			piece = nextState({
				well: well,
				score: 0,
				highestBlue: 0,
				piece: piece
			}, "D").piece;
		}

		// push first position
		var piecePositions = [piece];

		var seen = [];
		seen[hashCode(piece.x, piece.y, piece.o)] = 1;

		// a simple for loop won't work here because
		// we are increasing the list as we go
		var i = 0;
		while(i < piecePositions.length) {
			piece = piecePositions[i];

			// apply all possible moves
			moves.forEach(function(move) {
				var newState = nextState({
					well: well,
					score: 0,
					highestBlue: highestBlue,
					piece: piece
				}, move);
				var newPiece = newState.piece;

				// transformation failed?
				if(newPiece === null) {

					// piece locked? better add that to the list
					// do NOT check locations, they aren't significant here
					if(move === "D") {

						var newWell = newState.well;

						// here is the clever recursive search bit
						// higher is better
						var currentRating = newState.highestBlue + (
							d === 0 ?
								0
							:
								// deeper lines are worth less than immediate lines
								// this is so the game will never give you a line if it can avoid it
								// NOTE: make sure rating doesn't return a range of more than 100 values...
								worstPieceRating(newWell, newState.highestBlue, d - 1) / 100
						);

						// store
						if(bestRating === null || currentRating > bestRating) {
							bestRating = currentRating;
						}
					}
				}

				// transform succeeded?
				else {

					// new location? append to list
					// check locations, they are significant
					var newHashCode = hashCode(newPiece.x, newPiece.y, newPiece.o);

					if(seen[newHashCode] === undefined) {
						piecePositions.push(newPiece);
						seen[newHashCode] = 1;
					}
				}
			});
			i++;
		}

		return bestRating;
	}

	// initialise all variables for a new game or replay
	function clearField() {

		// empty well
		// zero score
		// top blue = wellDepth = 20
		liveState.well = [];
		for(var row = 0; row < wellDepth; row++) {
			liveState.well.push(0);
		}
		liveState.score = 0;
		liveState.highestBlue = wellDepth;

		// first piece
		liveState.piece = worstPiece(liveState.well, liveState.highestBlue);

		// Don't trash the replay, though

		draw(liveState, replayString);

		// new replay
		replayOut = [];
	}

	function draw(state, replayString) {
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
	}

	// accepts the input of a move and attempts to apply that
	// transform to the live piece in the live well.
	// returns false if the game is over afterwards,
	// returns true otherwise
	function inputHandler(move) {
		if(liveState.piece === null) {
			return;
		}

		liveState = nextState(liveState, move);

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
	}

	function inputKey(event) {

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
	}

	// this has to be done recursively, sigh
	function inputReplayStep() {
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
	}

	// clear the field and get ready for a new game
	function startGame() {

		// there may be a replay in progress, this
		// must be killed
		clearTimeout(replayTimeoutId);

		clearField();

		// prepare to take user input
		document.onkeydown = inputKey;
	}

	function startReplay() {

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
	}

	// pick the worst piece that could be put into this well
	// return the piece
	// but not its rating
	function worstPiece(well, highestBlue) {

		// iterate over all the pieces getting ratings
		// select the lowest
		var worstRating = null;
		var worstId = null;

		// we already have a list of possible pieces to iterate over
		var startTime = new Date().getTime();
		for(var i = 0; i < pieceIds.length; i++) {
			var id = pieceIds[i];
			var currentRating = bestWellRating(well, highestBlue, id, searchDepth);

			// update worstRating
			if(worstRating === null || currentRating < worstRating) {
				worstRating = currentRating;
				worstId = id;
			}

			// return instantly upon finding a 0
			if(worstRating === 0) {
				break;
			}
		}

		return {
			id : worstId,
			x  : Math.floor((wellWidth - 4) / 2),
			y  : 0,
			o  : 0
		};
	}

	// pick the worst piece that could be put into this well
	// return the rating of this piece
	// but NOT the piece itself...
	function worstPieceRating(well, highestBlue, d) {

		// iterate over all the pieces getting ratings
		// select the lowest
		var worstRating = null;

		// we already have a list of possible pieces to iterate over
		for(var i = 0; i < pieceIds.length; i++) {
			var id = pieceIds[i];
			var currentRating = bestWellRating(well, highestBlue, id, d);
			if(worstRating === null || currentRating < worstRating) {
				worstRating = currentRating;
			}

			// if we have a 0 then that suffices, no point in searching further
			// (except for benchmarking purposes)
			if(worstRating === 0) {
				return 0;
			}
		}

		return worstRating;
	}

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
