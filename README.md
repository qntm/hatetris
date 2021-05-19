# hatetris

This is the source code for [HATETRIS](https://qntm.org/hatetris).

## Writing a custom AI (coming soon/experimental)

A custom AI for HATETRIS should be a **JavaScript function expression** (or arrow function expression), looking something like this:

```js
(currentState, getNextStates) => {
  // Let's see if the player can get a Tetris right now
  const nextStates = getNextStates('I', currentState)
  for (const nextState of nextStates) {
    if (nextState.score === currentState.score + 4) {
      // Oh they can, so let's do that
      return 'I'
    }
  }

  // Just be random
  return ['I', 'J', 'L', 'O', 'S', 'T', 'Z'][Math.floor(Math.random() * 7)]
}
```

This function is called every time the game needs to create a new piece to provide to the player. This function has the form `(currentState, getNextStates) => pieceId`, where:

* `currentState` is an object `{ well, score }`, where:
  * `currentState.well` is an array of 20 binary numbers, one representing each row in the well from top to bottom. Each bit in each number represents a cell in that row: 0 if the cell is currently clear, and 1 if it is currently obstructed. (Note: the least significant bit represents the leftmost cell, so if the value is `0b0000000011`, the leftmost two cells in the row are occupied.)
  * `currentState.score` is the current score, a non-negative integer.
* `getNextStates` is a function `(pieceId, state) => nextStates`, where:
  * `pieceId` is any string indicating the name of a piece: "I", "J", "L", "O", "T", "S" or "Z"
  * `state` is **any** object `{ well, score }` conforming to the structure described above. `currentState` is suitable, but you can also create and pass your own hypotheticals
  * the returned `nextStates` is an array of all possible future well states which could ensue, taking into account every possible location where the player could land this piece. A single possible future well state such as `nextStates[0]` is another state object `nextState`, where:
    * `nextState.well` is the new well which results after the piece has been landed and any lines have been cleared
    * `nextState.score` is the new score, which could be up to 4 higher than the input score
* the returned `pieceId` is, again, any string indicating the name of a piece.

Very simple AIs might ignore the current state of the well or the possible futures:

```js
const iForever = () => 'I'
const sz = () => ['S', 'Z'][Math.floor(Math.rand() * 2)]
```

More advanced AIs might analyse the well to statically determine the best piece to send next.

`getPossibleFutures` is provided to make it possible to model future possibilities without laboriously reimplementing all of the game's movement code. The default HATETRIS algorithm uses `getPossibleFutures` to find all the possible outcomes for all possible pieces, rank those outcomes to find the best for each piece, and then select the piece with the worst best outcome. Other AIs could, for example, plug those possible futures back into `getPossibleFutures` to explore further into the future, or use different heuristics to rank the wells.

Because custom AIs can behave non-deterministically, replays are not available using custom AIs.

### Does this use `eval` internally? Isn't there a security risk from that?

Yes, and yes. You are at mortal risk of attacking yourself. Do not paste code into HATETRIS unless you understand every line of it.
