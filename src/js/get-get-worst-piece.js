"use strict";

var getGetPossibleFutures = require("./get-get-possible-futures.js");

var searchDepth = 0; // min = 0, suggested max = 1

module.exports = function(orientations, bar, wellDepth, wellWidth) {

	var getPossibleFutures = getGetPossibleFutures(orientations, bar, wellDepth, wellWidth);

	var getWellRating = function(well, highestBlue, depthRemaining) {
		return highestBlue + (
			depthRemaining === 0 ?
				0
			:
				// deeper lines are worth less than immediate lines
				// this is so the game will never give you a line if it can avoid it
				// NOTE: make sure rating doesn't return a range of more than 100 values...
				getWorstPieceRating(well, highestBlue, depthRemaining - 1) / 100
		);
	};

	/**
		Given a well and a piece, find the best possible location to put it.
		Return the best rating found.
	*/
	var getBestWellRating = function(well, highestBlue, pieceId, depthRemaining) {
		return Math.max.apply(Math, getPossibleFutures(well, highestBlue, pieceId).map(function(possibleFuture) {
			return getWellRating(possibleFuture.well, possibleFuture.highestBlue, depthRemaining);
		}));
	};

	var getWorstPieceDetails = function(well, highestBlue, depthRemaining) {
		return Object
			.keys(orientations)
			.map(function(pieceId) {
				return {
					id: pieceId,
					rating: getBestWellRating(well, highestBlue, pieceId, depthRemaining)
				};
			})
			.sort(function(a, b) {
				return a.rating - b.rating;
			})[0];
	};

	// pick the worst piece that could be put into this well
	// return the rating of this piece
	// but NOT the piece itself...
	var getWorstPieceRating = function(well, highestBlue, depthRemaining) {
		return getWorstPieceDetails(well, highestBlue, depthRemaining).rating;
	};

	// pick the worst piece that could be put into this well
	// return the piece but not its rating
	var getWorstPiece = function(well, highestBlue) {
		return {
			id : getWorstPieceDetails(well, highestBlue, searchDepth).id,
			x  : Math.floor((wellWidth - 4) / 2),
			y  : 0,
			o  : 0
		};
	};

	return getWorstPiece;
};
