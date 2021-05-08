'use strict'

interface Run {
  length: number,
  entry: any
}

const encode = (arr: any[], maxRunLength: number) => {
  const runs: Run[] = []
  arr.forEach(entry => {
    if (
      runs.length - 1 in runs &&
      runs[runs.length - 1].entry === entry &&
      runs[runs.length - 1].length < maxRunLength
    ) {
      runs[runs.length - 1].length++
    } else {
      runs.push({
        entry,
        length: 1
      })
    }
  })
  return runs
}

const decode = (runs: Run[]): any[] =>
  runs.flatMap(run => Array(run.length).fill(run.entry))

export default { encode, decode }
