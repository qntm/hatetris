# hatetris

This is the source code for [HATETRIS](https://qntm.org/hatetris).

## Writing a custom AI (coming soon/experimental)

A custom AI for HATETRIS should be a **JavaScript function expression** (or arrow function expression), looking something like this:

```js
// Constructor function.
// Called at the start of a every new game.
getNextStates => {
  // You can initialise some local variables and state here
  const badPieces = ['O', 'S', 'Z']
  let badPieceId = 0

  // AI function.
  // Called every time the game needs to spawn a new piece to provide to the player.
  // In this example, we return a constant stream of 4x1s, unless the well is all set
  // up for a Tetris, in which case we return something unhelpful
  return currentState => {
    const nextStates = getNextStates('I', currentState)
    for (const nextState of nextStates) {
      if (nextState.score === currentState.score + 4) {
        const badPiece = badPieces[badPieceId]
        badPieceId = (badPieceId + 1) % badPieces.length
        return badPiece
      }
    }

    return 'I'
  }
}
```

This function has the form `getNextStates => currentState => nextPieceId`, where:

* `getNextStates` is a helper function `(pieceId, state) => nextStates`, where:
  * `pieceId` can be any string indicating the name of a piece: "I", "J", "L", "O", "S", "T" or "Z"
  * `state` can be any **well state object** (see below). You can pass `currentState` here, but you can also create and pass your own hypotheticals
  * the returned `nextStates` is an array of all of the possible well state objects which could ensue, taking into account every possible location where the player could land this piece
* `currentState` is the current well state object
* the returned `nextPieceId` is the name of the piece the game should spawn now

A well state object has the form `{ well, score }`, where:

* `well` is an array of 20 binary numbers, one representing each row in the well from top to bottom. Each bit in each number represents a cell in that row: 0 if the cell is currently clear, and 1 if it is currently obstructed. (Note: the least significant bit represents the first cell, so if the value is `0b0000000011`, the leftmost two cells in the row are occupied.)
* `score` is the current score, a non-negative integer.

Very simple AIs might ignore both the current state of the well and the possible next states:

```js
const iForever = () => () => 'I'
const sz = () => () => ['S', 'Z'][Math.floor(Math.rand() * 2)]
```

More advanced AIs might analyse the well to statically determine the best piece to send next.

```js
const oneIOnly = () =>
  currentState =>
    currentState.well[currentState.well.length - 1] === 0
      ? 'I' // when the well is empty, send a 4x1
      : 'S' // otherwise S pieces forever
```

`getPossibleFutures` is provided to make it possible to model future possibilities without laboriously reimplementing all of the game's movement code. For example, the default HATETRIS algorithm uses `getNextStates` to find all the possible outcomes for all possible pieces, rank those outcomes to find the best for each piece, and then select the piece with the worst best outcome. Other AIs could, for example, plug those possible futures back into `getNextStates` to explore further into the future, or use different heuristics to rank the wells.

Because custom AIs can behave non-deterministically, replays are not available using custom AIs.

### Does this use `eval` internally? Isn't there a security risk from that?

Yes, and yes. You are at mortal risk of attacking yourself. Do not paste code into HATETRIS unless you understand every line of it.
