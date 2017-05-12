/**
	Input {well, score, highestBlue, piece} and a move, return
	the new {well, score, highestBlue, piece}.
*/
module.exports = function(orientations, bar, wellDepth, wellWidth, state, move) {
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
