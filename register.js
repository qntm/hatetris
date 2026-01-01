import fs from 'node:fs'
import module from 'node:module'
import url from 'node:url'

import babel from '@babel/core'

module.registerHooks({
  load (urlToLoad, context, nextLoad) {
    // Transpile TSX to plain JavaScript
    if (urlToLoad.endsWith('.tsx')) {
      const filename = url.fileURLToPath(urlToLoad)
      const content = fs.readFileSync(filename, 'utf8')

      // Do NOT compile to CommonJS modules, leave as ES modules.
      // Note that no TypeScript type checking takes place.
      const transformed = babel.transformSync(content, {
        filename: urlToLoad,
        presets: [
          ['@babel/preset-react', {
            development: true,
            useBuiltIns: true
          }],
          ['@babel/preset-typescript', {
            isTSX: true,
            allExtensions: true
          }]
        ],
        retainLines: true
      })

      // console.log(transformed.code.split('\n').map((l, i) => `${i + 1} ${l}`).join('\n'))

      return {
        shortCircuit: true,
        format: 'module',
        source: transformed.code
      }
    }

    return nextLoad(urlToLoad, context)
  }
})
