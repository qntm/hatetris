import fsPromises from 'node:fs/promises'

import * as esbuild from 'esbuild'

import { config } from '../config/esbuild.config.js'

const result = await esbuild.build({
  ...config,
  define: {
    'window.__HATETRIS_ENV__': JSON.stringify('production')
  }
})

await fsPromises.rm('./bundle-analysis', { recursive: true, force: true })
await fsPromises.mkdir('./bundle-analysis')
await fsPromises.writeFile('./bundle-analysis/meta.json', JSON.stringify(result.metafile, null, 2))
