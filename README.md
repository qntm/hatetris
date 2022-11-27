# hatetris

This is the source code for [HATETRIS](https://qntm.org/hatetris).

## List of AIs

### HATETRIS

The original and worst. Designed by me, qntm, in 2010, this was intended to be the toughest Tetris piece selection AI ever.

### HATETRIS Mild

This is a slightly simplified version of the HATETRIS algorithm which omits a piece of specialised logic intended to prevent wells from repeating and thereby prevent players from being able to catch the game in a loop and play forever.

Due to this omission, it [possible to play against HATETRIS Mild forever](https://github.com/qntm/hatetris/blob/c48c1d5f1064e75d941c3d83f0916bf85fedfe5a/src/components/Game/logic.spec.ts#L200-L238), and get an unbounded number of lines.

### LOVETRIS

Provides I pieces every time.

### Brzustowski (1992)

Implements the algorithm described in John Brzustowski's 1992 paper [Can you win at Tetris?](https://open.library.ubc.ca/media/download/pdf/831/1.0079748/1). The answer to the question is "No"; Brzustowski proved that it is impossible to play against this algorithm forever. He was the first to prove this result.

### Burgiel (1997)

Implements the algorithm described in Heidi Burgiel's 1997 paper [How to lose at Tetris](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.55.8562&rep=rep1&type=pdf). Burgiel provides a much simpler Tetris algorithm which pays no attention to the current state of the well when selecting the next piece, instead simply alternating S and Z pieces forever, and proves that this algorithm, too, is undefeatable.

## Writing a custom AI

A custom AI for HATETRIS should be a possibly-[`async`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) **JavaScript [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)** (or [arrow function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)), looking something like this:

```js
// AI function.
// Called every time the game needs to spawn a new piece to provide to the player.
// In this example, we return a constant stream of 4x1s, unless the well is all set
// up for a Tetris, in which case we return an S piece
(currentWellState, currentAiState, getNextWellStates) => {
  const nextWellStates = getNextWellStates(currentWellState, 'I')
  for (const nextWellState of nextWellStates) {
    if (nextWellState.score === currentWellState.score + 4) {
      return 'S'
    }
  }

  return 'I'
}
```

This function **must be deterministic**, otherwise replays cease to work. In particular, do not use `Math.random` or refer to the current date.

`currentWellState` is the current *well state object*. This has the form `{ well, score }`, where:

* `well` is an array of 20 binary numbers, one representing each row in the well from top to bottom. Each bit in each number represents a cell in that row: 0 if the cell is currently clear, and 1 if it is currently obstructed. (Note: the least significant bit represents the first cell, so if the value is `0b0000000011`, the leftmost two cells in the row are occupied.)
* `score` is the current score, a non-negative integer.

`currentAiState` is the current *AI state value*. When spawning the very first piece, this value is `undefined`. For later piece spawns, this value is whatever AI state value you returned last time. **This value should be considered deeply immutable,** as mutations break the behaviour of undo and redo, which in turn breaks replays. If the value is an object or array and you need to make changes to it, such as adding a new property to the object or splicing some content out of the array, you will need to clone the value first.

`getNextStates` is a helper function `(wellState, pieceId) => nextWellStates`, where:

* `state` can be any well state object. You can pass `currentWellState` here, but you can also create and pass your own hypotheticals.
* `pieceId` can be any string indicating the name of a piece: "I", "J", "L", "O", "S", "T" or "Z".
* The returned `nextWellStates` is an array of all of the possible new well state objects which could ensue, taking into account every possible location where the player could land this piece.

The return value from the overall AI function should normally be another piece ID, indicating which piece the game should spawn now.

Alternatively, the return value can be an array `[nextPieceId, nextAiState]`, where:

* `nextPieceId` will be used as the next piece ID.
* `nextAiState` can be any value. This value will be passed in as `currentAiState` next time your custom AI function is called.

If you return a piece ID by itself, then implicitly the returned value of `nextAiState` is `currentAiState` - that is, the AI state object is left unchanged for the next time your custom AI function is called.

### Examples

A [very simple AI](https://github.com/qntm/hatetris/blob/2ab79fe767f7004a30882e3fd547a055f44cf8a6/src/enemy-ais/lovetris-ai.ts) might ignore all arguments and return the same thing every time:

```js
() => 'I'
```

A more advanced AI might analyse the current layout of the well to statically determine the best piece to send next:

```js
currentWellState =>
  currentWellState.well[currentWellState.well.length - 1] === 0
    ? 'I' // when the well is empty, send a 4x1
    : 'S' // otherwise S pieces forever
```

You can use the AI state value to store state between function calls:

```js
// Ignore well state. Return S and Z pieces, alternating
(_, currentAiState) =>
  currentAiState?.last === 'S'
    ? ['Z', { last: 'Z' }]
    : ['S', { last: 'S' }]
```

More advanced AIs still will make use of `getNextStates`. This helper function is provided to make it possible to model future possibilities without laboriously reimplementing all of the game's movement code. For example, [the default HATETRIS algorithm](https://github.com/qntm/hatetris/blob/9b683713050a72d12c5bd6ba4657c9237030fa74/src/enemy-ais/hatetris-ai.ts) uses `getNextStates` to find all the possible outcomes for all possible pieces, rank those outcomes to find the best for each piece, and then select the piece with the worst best outcome. Other AIs could, for example, plug those possible futures back into `getNextStates` to explore further into the future, or use different heuristics to rank the wells and decide how to prune the search tree.

An AI may also be asynchronous:

```js
async currentWellState => {
  const result = await someLongerCalculationOrCall()
  return result === true ? 'I' : 'S'
}
```

### Does this use `eval` internally? Isn't there a security risk from that?

Yes, and yes. You are at mortal risk of attacking yourself. Do not paste code into HATETRIS unless you trust it.
