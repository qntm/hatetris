import module_ from 'node:module'

module_.register('./loader-hook.js', import.meta.url)
