import fs from 'node:fs'
import babel from '@babel/core'

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    // Strip out all the TypeScript, and the JSX too if necessary
    if (!url.startsWith('file:///')) {
      throw Error(`Don't know how to convert url ${url} to a filename`)
    }
    const filename = url.substring('file:///'.length)

    // Don't compile JSX unless we need to
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
    const transformed = await babel.transformFileAsync(filename, { presets })

    return {
      shortCircuit: true,
      format: 'module',
      source: transformed.code
    }
  }

  return await nextLoad(
    url,
    context // Fun fact, the need to pass this argument is not documented!
  )
}
