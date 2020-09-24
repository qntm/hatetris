'use strict'

const encode = (arr, maxRunLength) => {
  const runs = []
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
