'use strict'

export default (wellWidth, pieceId) => ({
  id: pieceId,
  x: Math.floor((wellWidth - 4) / 2),
  y: 0,
  o: 0
})
