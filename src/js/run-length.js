'use strict'

const encode = (arr, maxRunLength) => {
  const runs = []

  arr.forEach(entry => {
    if (
      runs.length === 0 ||
      runs[runs.length - 1].entry !== entry ||
      runs[runs.length - 1].length === maxRunLength
    ) {
      runs.push({
        entry: entry,
        length: 0
      })
    }

    runs[runs.length - 1].length++
  })
  return runs
}

const decode = runs => {
  const entries = []
  runs.forEach(run => {
    for (let i = 0; i < run.length; i++) {
      entries.push(run.entry)
    }
  })
  return entries
}

export default { encode, decode }
