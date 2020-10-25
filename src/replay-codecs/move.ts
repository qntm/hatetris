// Day one gross hacks
// <https://stackoverflow.com/questions/51528780/typescript-check-typeof-against-custom-type/51529486#51529486>
const moves = ['L', 'R', 'D', 'U']
type Move = (typeof moves)[number]
const isMove = (x: any): x is Move => moves.includes(x)

export type { Move }
export { isMove }
