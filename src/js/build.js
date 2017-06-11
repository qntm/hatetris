/**
	HATETRIS instance builder
*/

"use strict";

var firstState = require("./first-state.js");
var nextStateFactory = require("./next-state-factory.js");
var replay = require("./replay.js");

var minWidth = 4;

module.exports = function(orientations, bar, wellDepth, wellWidth, worstPiece, replayTimeout) {
	if(orientations.length < 1) {
		throw Error("Have to have at least one piece!");
	}
	if(wellDepth < bar) {
		throw Error("Can't have well with depth " + String(wellDepth) + " less than bar at " + String(bar));
	}
	if(wellWidth < minWidth) {
		throw Error("Can't have well with width " + String(wellWidth) + " less than " + String(minWidth));
	}

	var nextState = nextStateFactory(orientations, bar, wellDepth, wellWidth);

	// Internals
	var model = {
		mode: "GAME_OVER",
		wellState: undefined,
		replayOut: undefined,
		replayIn: undefined
	};

	var draw = function(model) {
		var mode = model.mode;

		var wellState = model.wellState;
		if(wellState) {
			var well = wellState.well;
			var piece = wellState.piece;

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
			document.getElementById("score").innerHTML = String(wellState.score);
		}

		// Spit out a replay, if there is one
		var elem = document.getElementById("replayOut");
		while(elem.hasChildNodes()) {
			elem.removeChild(elem.firstChild);
		}
		if(mode === "GAME_OVER") {
			elem.appendChild(document.createTextNode("replay of last game: " + replay.encode(model.replayOut)));
		}
	};

	// initialise all variables for a new game or replay
	var clearField = function() {

		// empty well
		// zero score
		// top blue = wellDepth = 20
		model.wellState = firstState(wellDepth);

		// first piece
		model.wellState.piece = worstPiece(model.wellState.well, model.wellState.highestBlue);

		// Don't trash the replay, though

		draw(model);

		// new replay
		model.replayOut = [];
	};

	// accepts the input of a move and attempts to apply that
	// transform to the live piece in the live well.
	// returns false if the game is over afterwards,
	// returns true otherwise
	var inputHandler = function(move) {
		model.wellState = nextState(model.wellState, move);

		// update replayOut
		model.replayOut.push(move);

		// is the game over?
		// it is impossible to get bits at row (bar - 2) or higher without getting a bit at row (bar - 1)
		// so there is only one line which we need to check
		var gameContinues = model.wellState.well[bar - 1] === 0;
		if(gameContinues) {
			// no live piece? make a new one
			// suited to the new world, of course
			if(model.wellState.piece === null) {
				model.wellState.piece = worstPiece(model.wellState.well, model.wellState.highestBlue);
			}
		} else {
			setMode("GAME_OVER");
		}

		draw(model);

		return gameContinues;
	};

	var inputKey = function(event) {
		if(model.mode !== "PLAYING") {
			console.warn("Ignoring keystroke", event);
			return;
		}

		event = event || window.event; // add for IE
		var move = null;

		switch(event.keyCode) {
			case 37: move = "L"; break;
			case 39: move = "R"; break;
			case 40: move = "D"; break;
			case 38: move = "U"; break;
			default: return;
		}

		// make that move
		// move is sanitised
		inputHandler(move);
	};

	var setMode = function(mode) {
		console.log(mode);
		model.mode = mode;
	};

	// this has to be done recursively, sigh
	var inputReplayStep = function() {
		if(model.mode === "REPLAYING") {
			// if there is still replay left, time in another step from the replay
			// otherwise, allow the user to continue the game
			if(model.replayIn.length === 0) {
				setMode("PLAYING");
			} else {
				var move = model.replayIn.shift();
				inputHandler(move);

				model.replayTimeoutId = setTimeout(inputReplayStep, replayTimeout);
			}
		}

		// Ignore the call to inputReplayStep in "GAME_OVER"
		// or "PLAYING" modes.
	};

	// clear the field and get ready for a new game
	var startGame = function() {
		setMode("PLAYING");

		// there may be a replay in progress, this
		// must be killed
		if('replayTimeoutId' in model) {
			clearTimeout(model.replayTimeoutId);
			delete model.replayTimeoutId;
		}

		clearField();
	};

	var startReplay = function() {
		setMode("REPLAYING");

		// there may be a replay in progress, this
		// must be killed
		if('replayTimeoutId' in model) {
			clearTimeout(model.replayTimeoutId);
			delete model.replayTimeoutId;
		}

		// user inputs replay string
		var string = prompt() || ""; // change for IE
		model.replayIn = replay.decode(string);

		// GO
		clearField();

		// line up first step (will trigger own later steps)
		inputReplayStep();
	};

	var handleEvent = function(event) {
		if(event === "startGame") {
			startGame();
		}

		if(event === "startReplay") {
			startReplay();
		}
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
			{y: 0, x: 1, move: "U", symbol: "\u27F3", title: "Up to rotate"},
			{y: 1, x: 0, move: "L", symbol: "\u2190", title: "Left"},
			{y: 1, x: 1, move: "D", symbol: "\u2193", title: "Down"},
			{y: 1, x: 2, move: "R", symbol: "\u2192", title: "Right"}
		];
		buttons.forEach(function(button) {
			var td = tbody.rows[button.y].cells[button.x];
			td.appendChild(document.createTextNode(button.symbol));
			td.title = button.title;
			td.addEventListener("click", function() {
				inputHandler(button.move);
			});
			td.classList.add("manual");
		});
		document.getElementById("start").addEventListener("click", function() {
			handleEvent("startGame");
		});
		document.getElementById("replay").addEventListener("click", function() {
			handleEvent("startReplay");
		});

		document.onkeydown = inputKey;
	})();
};
