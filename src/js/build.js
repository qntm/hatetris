/**
	HATETRIS instance builder
*/

"use strict";

var firstStateFactory = require("./first-state-factory.js");
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

	var firstState = firstStateFactory(wellDepth, worstPiece);
	var nextState = nextStateFactory(orientations, bar, wellDepth, wellWidth);

	var draw = function(model) {
		if(model.wellStateId !== -1) {
			var wellState = model.wellStates[model.wellStateId];
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
		if(model.mode === "GAME_OVER" && model.replayOut) {
			elem.appendChild(document.createTextNode("replay of last game: " + replay.encode(model.replayOut)));
		}
	};

	// accepts the input of a move and attempts to apply that
	// transform to the live piece in the live well.
	// returns false if the game is over afterwards,
	// returns true otherwise
	var handleMove = function(model, move) {
		var lastWellStateId = model.wellStateId;
		var lastWellState = model.wellStates[lastWellStateId];
		var wellState = nextState(lastWellState, move);

		// is the game over?
		// it is impossible to get bits at row (bar - 2) or higher without getting a bit at row (bar - 1)
		// so there is only one line which we need to check
		var mode = model.mode;
		if(wellState.well[bar - 1] === 0) {
			// no live piece? make a new one
			// suited to the new world, of course
			if(wellState.piece === null) {
				wellState.piece = worstPiece(wellState.well, wellState.highestBlue);
			}
		} else {
			mode = "GAME_OVER";
		}

		// Remember, there's always one fewer replay step than
		// there are well states
		var wellStates, replayOut;
		if(move === model.replayOut[lastWellStateId]) {
			// Follow the replay forward
			wellStates = model.wellStates;
			replayOut = model.replayOut;
		} else {
			wellStates = model.wellStates.slice(0, lastWellStateId + 1).concat([wellState]);
			replayOut = model.replayOut.slice(0, lastWellStateId).concat([move]);
		}

		return {
			mode: mode,
			wellStateId: model.wellStateId + 1,
			wellStates: wellStates,
			replayOut: replayOut,
			replayIn: model.replayIn,
			replayTimeoutId: undefined
		};
	};

	var model = {
		mode: "GAME_OVER",
		wellStateId: -1,
		wellStates: [],
		replayOut: undefined,
		replayIn: undefined,
		replayTimeoutId: undefined
	};

	var handleEvent = function(event) {
		if(event === "inputReplayStep") {
			model.replayTimeoutId = undefined;
			if(model.mode === "REPLAYING") {
				// if there is still replay left, time in another step from the replay
				// otherwise, allow the user to continue the game
				if(model.replayIn.length === 0) {
					model.mode = "PLAYING";
				} else {
					var move = model.replayIn.shift();
					model = handleMove(model, move);

					model.replayTimeoutId = setTimeout(function() {
						handleEvent("inputReplayStep");
					}, replayTimeout);
				}
			} else {
				// Ignore the call to inputReplayStep in "GAME_OVER"
				// or "PLAYING" modes.
				console.warn("Ignoring event", event, "because mode is", model.mode);
			}
		}

		else if(event === "startGame") {
			// there may be a replay in progress, this
			// must be killed
			if(model.replayTimeoutId) {
				clearTimeout(model.replayTimeoutId);
				model.replayTimeoutId = undefined;
			}

			// clear the field and get ready for a new game
			model = {
				mode: "PLAYING",
				wellStateId: 0,
				wellStates: [firstState],
				replayOut: [],
				replayIn: undefined,
				replayTimeoutId: undefined
			};
		}

		else if(event === "startReplay") {
			// there may be a replay in progress, this
			// must be killed
			if(model.replayTimeoutId) {
				clearTimeout(model.replayTimeoutId);
				model.replayTimeoutId = undefined;
			}

			// user inputs replay string
			var string = prompt() || ""; // change for IE
			var replayIn = replay.decode(string);

			// GO
			model = {
				mode: "REPLAYING",
				wellStateId: 0,
				wellStates: [firstState],
				replayOut: [],
				replayIn: replayIn,

				// line up first step (will trigger own later steps)
				replayTimeoutId: setTimeout(function() {
					handleEvent("inputReplayStep");
				}, 0)
			};
		}

		// Key moves
		else if(event === "L" || event === "R" || event === "D" || event === "U") {
			if(model.mode === "PLAYING") {
				model = handleMove(model, event);
			} else {
				console.warn("Ignoring event", event, "because mode is", model.mode);
			}
		}

		else if(event === "clickL" || event === "clickR" || event === "clickD" || event === "clickU") {
			if(model.mode === "PLAYING") {
				model = handleMove(model, event.substring("click".length));
			} else {
				console.warn("Ignoring event", event, "because mode is", model.mode);
			}
		}

		// Undo
		else if(event === "Z" || event === "clickZ") {
			// there may be a replay in progress, this
			// must be killed
			if(model.replayTimeoutId) {
				clearTimeout(model.replayTimeoutId);
				model.replayTimeoutId = undefined;
			}

			if(model.wellStateId > 0) {
				model = {
					mode: "PLAYING",
					wellStateId: model.wellStateId - 1,
					wellStates: model.wellStates, // Don't slice it off!
					replayOut: model.replayOut, // Don't slice it off!
					replayIn: undefined,
					replayTimeoutId: undefined
				};
			} else {
				console.warn("Ignoring event", event, "because start of history has been reached");
			}
		}

		// Redo
		// TODO: merge this functionality with `inputReplayStep`,
		// merge `model.replayOut` and `model.replayIn`
		else if(event === "Y" || event === "clickY") {
			if(model.mode === "PLAYING") {
				if(model.wellStateId < model.wellStates.length - 1) {
					model = handleMove(model, model.replayOut[model.wellStateId]);
				} else {
					console.warn("Ignoring event", event, "because end of history has been reached");
				}
			} else {
				console.warn("Ignoring event", event, "because mode is", model.mode);
			}
		}

		else {
			throw Error("Ignoring unrecognised event: " + event);
		}

		draw(model);
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
			{y: 0, x: 0, event: "clickZ", symbol: "\u21B6", title: "Press Ctrl+Z to undo"},
			{y: 0, x: 1, event: "clickU", symbol: "\u27F3", title: "Press Up to rotate"},
			{y: 0, x: 2, event: "clickY", symbol: "\u21B7", title: "Press Ctrl+Y to redo"},
			{y: 1, x: 0, event: "clickL", symbol: "\u2190", title: "Press Left to move left"},
			{y: 1, x: 1, event: "clickD", symbol: "\u2193", title: "Press Down to move down"},
			{y: 1, x: 2, event: "clickR", symbol: "\u2192", title: "Press Right to move right"}
		];
		buttons.forEach(function(button) {
			var td = tbody.rows[button.y].cells[button.x];
			td.appendChild(document.createTextNode(button.symbol));
			td.title = button.title;
			td.addEventListener("click", function() {
				handleEvent(button.event);
			});
			td.classList.add("manual");
		});
		document.getElementById("start").addEventListener("click", function() {
			handleEvent("startGame");
		});
		document.getElementById("replay").addEventListener("click", function() {
			handleEvent("startReplay");
		});

		document.onkeydown = function(event) {
			event = event || window.event; // add for IE

			if(event.keyCode === 37) {
				handleEvent("L");
			} else if(event.keyCode === 39) {
				handleEvent("R");
			} else if(event.keyCode === 40) {
				handleEvent("D");
			} else if(event.keyCode === 38) {
				handleEvent("U");
			} else if(event.keyCode === 90 && event.ctrlKey === true) {
				handleEvent("Z");
			} else if(event.keyCode === 89 && event.ctrlKey === true) {
				handleEvent("Y");
			}
		};

		draw(model);
	})();
};
