// When we have our `package.json` configured with `"type": "module"`, we opt
// in to stricter module resolution behaviour. This causes Node.js to raise an
// ERR_UNKNOWN_FILE_EXTENSION error if we attempt to `node a.ts` at the command
// line or `import 'a.tsx'` in code. To work around this, Node.js exposes an
// experimental loader API [1] which can be used to modify the default module
// loading behaviour. We use this to add a custom loader for TypeScript and TSX
// files - one which uses Babel to transpile JSX and TypeScript type
// annotations away. We use this during Mocha testing.
// [1] https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders

import assert from 'node:assert'
import babel from '@babel/core'

export async function load (url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    assert.strictEqual(url.startsWith('file:///'), true, `Don't know how to convert url ${url} to a filename`)
    const filename = url.substring('file:///'.length)

    // We want this transformation to be fast, so don't compile JSX unless we
    // need to. Do NOT compile to CommonJS modules, leave as ES modules. Note
    // that no TypeScript type checking takes place.
    const presets = url.endsWith('.tsx')
      ? [
          ['@babel/preset-react'],
          ['@babel/preset-typescript', {
            isTSX: true,
            allExtensions: true
          }]
        ]
      : [
          '@babel/preset-typescript'
        ]

    const transformed = await babel.transformFileAsync(filename, {
      presets,
      retainLines: true
    })

    return {
      shortCircuit: true,
      format: 'module',
      source: transformed.code
    }
  }

  return nextLoad(
    url,
    context // Fun fact, the need to pass this argument is not documented!
  )
}
