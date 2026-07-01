import fs from 'node:fs'
import url from 'node:url'

import * as esbuild from 'esbuild'

export async function load (urlToLoad, context, nextLoad) {
  if (urlToLoad.endsWith('.tsx')) {
    const filename = url.fileURLToPath(urlToLoad)
    const content = fs.readFileSync(filename, 'utf8')

    const transformed = await esbuild.transform(content, {
      sourcefile: urlToLoad,
      loader: 'tsx',
      sourcemap: 'inline'
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
