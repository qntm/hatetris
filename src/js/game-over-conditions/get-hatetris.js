/**
  Game over conditions for HATETRIS. This is very simple, all we need
  to do is test for whether there is a piece above the bar
*/

export default bar =>
  // Is the game over?
  // It is impossible to get bits at row (bar - 2) or higher without getting a bit at row (bar - 1),
  // so there is only one line which we need to check.
  wellState => wellState.well[bar - 1] !== 0
