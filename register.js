import module_ from 'node:module'
module_.register('./loader.js', import.meta.url)
