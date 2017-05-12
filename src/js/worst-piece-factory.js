var moves = require("./moves.js");
var nextState = require("./next-state.js");

var searchDepth = 0; // min = 0, suggested max = 1

module.exports = function(orientations, bar, wellDepth, wellWidth) {

	/**
		Given a well and a piece, find the best possible location to put it.
		Return the best rating found.
	*/
	var bestWellRating = function(well, highestBlue, pieceId, depthRemaining) {
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
			piece = nextState(orientations, bar, wellDepth, wellWidth, {
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
				var newState = nextState(orientations, bar, wellDepth, wellWidth, {
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
							depthRemaining === 0 ?
								0
							:
								// deeper lines are worth less than immediate lines
								// this is so the game will never give you a line if it can avoid it
								// NOTE: make sure rating doesn't return a range of more than 100 values...
								worstPieceRating(newWell, newState.highestBlue, depthRemaining - 1) / 100
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
	};

	// pick the worst piece that could be put into this well
	// return the piece but not its rating
	var worstPieceDetails = function(well, highestBlue, depthRemaining) {

		// iterate over all the pieces getting ratings
		// select the lowest
		var worstRating = null;
		var worstId = null;

		// we already have a list of possible pieces to iterate over
		for(var pieceId = 0; pieceId < orientations.length; pieceId++) {
			var currentRating = bestWellRating(well, highestBlue, pieceId, depthRemaining);

			// update worstRating
			if(worstRating === null || currentRating < worstRating) {
				worstRating = currentRating;
				worstId = pieceId;
			}

			// return instantly upon finding a 0
			if(worstRating === 0) {
				break;
			}
		}

		return {
			rating: worstRating,
			id: worstId
		};
	};

	// pick the worst piece that could be put into this well
	// return the rating of this piece
	// but NOT the piece itself...
	var worstPieceRating = function(well, highestBlue, depthRemaining) {
		return worstPieceDetails(well, highestBlue, depthRemaining).rating;
	};

	var worstPiece = function(well, highestBlue) {
		return {
			id : worstPieceDetails(well, highestBlue, searchDepth).id,
			x  : Math.floor((wellWidth - 4) / 2),
			y  : 0,
			o  : 0
		};
	};

	return worstPiece;
};
