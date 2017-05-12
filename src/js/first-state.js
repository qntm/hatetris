module.exports = function(wellDepth) {
	var state = {};

	state.well = [];
	for(var row = 0; row < wellDepth; row++) {
		state.well.push(0);
	}
	state.score = 0;
	state.highestBlue = wellDepth;
	state.piece = null;

	return state;
};
