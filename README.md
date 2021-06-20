# hatetris

This is the source code for [HATETRIS](https://qntm.org/hatetris).

## Writing a custom AI

A custom AI for HATETRIS should be a **JavaScript [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)** (or [arrow function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)), looking something like this:

```js
// AI function.
// Called every time the game needs to spawn a new piece to provide to the player.
// In this example, we return a constant stream of 4x1s, unless the well is all set
// up for a Tetris, in which case we return an S piece
(currentState, getNextStates) => {
  const nextStates = getNextStates(currentState, 'I')
  for (const nextState of nextStates) {
    if (nextState.score === currentState.score + 4) {
      return 'S'
    }
  }

  return 'I'
}
```

This function has the form `(currentState, getNextStates) => nextPieceId`, where:

* `currentState` is the current well state object
* `getNextStates` is a helper function `(state, pieceId) => nextStates`, where:
  * `state` can be any **well state object** (see below). You can pass `currentState` here, but you can also create and pass your own hypotheticals
  * `pieceId` can be any string indicating the name of a piece: "I", "J", "L", "O", "S", "T" or "Z"
  * the returned `nextStates` is an array of all of the possible new well state objects which could ensue, taking into account every possible location where the player could land this piece
* the returned `nextPieceId` is the name of the piece the game should spawn now

A well state object has the form `{ well, score }`, where:

* `well` is an array of 20 binary numbers, one representing each row in the well from top to bottom. Each bit in each number represents a cell in that row: 0 if the cell is currently clear, and 1 if it is currently obstructed. (Note: the least significant bit represents the first cell, so if the value is `0b0000000011`, the leftmost two cells in the row are occupied.)
* `score` is the current score, a non-negative integer.

Very simple AIs might ignore both the current state of the well and the possible next states:

```js
() => 'I'
```

```js
() => ['S', 'Z'][Math.floor(Math.rand() * 2)]
```

More advanced AIs might analyse the current layout of the well to statically determine the best piece to send next:

```js
currentState =>
  currentState.well[currentState.well.length - 1] === 0
    ? 'I' // when the well is empty, send a 4x1
    : 'S' // otherwise S pieces forever
```

However, more advanced AIs still will make use of `getNextStates`. This helper function is provided to make it possible to model future possibilities without laboriously reimplementing all of the game's movement code. For example, the default HATETRIS algorithm uses `getNextStates` to find all the possible outcomes for all possible pieces, rank those outcomes to find the best for each piece, and then select the piece with the worst best outcome. Other AIs could, for example, plug those possible futures back into `getNextStates` to explore further into the future, or use different heuristics to rank the wells and decide how to prune the search tree.

Because custom AIs can behave non-deterministically, replays are not available using custom AIs.

### Does this use `eval` internally? Isn't there a security risk from that?

Yes, and yes. You are at mortal risk of attacking yourself. Do not paste code into HATETRIS unless you understand every line of it.
