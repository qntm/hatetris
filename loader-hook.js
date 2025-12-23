// When we have our `package.json` configured with `"type": "module"`, we opt
// in to stricter module resolution behaviour. This causes Node.js to raise an
// ERR_UNKNOWN_FILE_EXTENSION error if we attempt to `node a.ts` at the command
// line or `import 'a.tsx'` in code. To work around this, Node.js exposes an
// experimental loader API [1] which can be used to modify the default module
// loading behaviour. We use this to add a custom loader for TypeScript and TSX
// files - one which uses Babel to transpile JSX and TypeScript type
// annotations away. We use this during Mocha testing.
// [1] https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders

import fs from 'node:fs'

import babel from '@babel/core'

const lookup = {
  js: 'ts',
  jsx: 'tsx',
  cjs: 'cts',
  cjsx: 'ctsx',
  mjs: 'mts',
  mjsx: 'mtsx'
}

// If the specifier ends with ".js" or ".jsx", this could be a lie -
// search for the corresponding .ts or .tsx file on disk and, if present,
// return that filename instead instead
const getTsFilename = specifier => {
  if (!specifier.startsWith('file:///')) {
    // e.g. 'node:assert'
    return null
  }

  // It is late and I am too tired to figure out the proper way to do this
  /* c8 ignore start */
  const filename = process.platform === 'win32'
    ? specifier.substring('file:///'.length)
    : specifier.substring('file://'.length)
  /* c8 ignore end */

  let tsFilename = null
  for (const [jsExt, tsExt] of Object.entries(lookup)) {
    if (filename.endsWith(`.${jsExt}`)) {
      tsFilename = filename.substring(0, filename.length - `.${jsExt}`.length) + `.${tsExt}`
      break
    }
    if (filename.endsWith(`.${tsExt}`)) {
      tsFilename = filename
      break
    }
  }

  if (tsFilename === null) {
    // Possibly unreachable
    return null
  }

  try {
    fs.statSync(tsFilename)
    return tsFilename
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // E.g. permissions error
      throw error
    }
    // Otherwise, .ts file doesn't exist.
  }

  return null
}

export async function resolve (specifier, context, nextResolve) {
  const { parentURL = null } = context

  const absSpecifier = parentURL === null
    ? new URL(specifier).href
    : new URL(specifier, parentURL).href

  const tsFilename = getTsFilename(absSpecifier)

  if (tsFilename !== null) {
    return {
      shortCircuit: true,
      url: 'file:///' + tsFilename
    }
  }

  return nextResolve(specifier, context)
}

export async function load (url, context, nextLoad) {
  const tsFilename = getTsFilename(url)

  if (tsFilename !== null) {
    const content = fs.readFileSync(tsFilename, 'utf8')

    // We want this transformation to be fast, so don't compile JSX unless we
    // need to. Do NOT compile to CommonJS modules, leave as ES modules. Note
    // that no TypeScript type checking takes place.
    const presets = tsFilename.endsWith('.tsx')
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

    const transformed = babel.transformSync(content, {
      filename: tsFilename,
      presets,
      retainLines: true
    })

    return {
      shortCircuit: true,
      format: 'module',
      source: transformed.code
    }
  }

  return nextLoad(url, context)
}
