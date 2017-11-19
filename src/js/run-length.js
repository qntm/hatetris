'use strict'

module.exports = {
  encode: function (arr, maxRunLength) {
    var runs = []

    arr.forEach(function (entry) {
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
  },

  decode: function (runs) {
    var entries = []
    runs.forEach(function (run) {
      for (var i = 0; i < run.length; i++) {
        entries.push(run.entry)
      }
    })
    return entries
  }
}
