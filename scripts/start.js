import express from 'express'
import WebpackDevServerUtils from 'react-dev-utils/WebpackDevServerUtils.js'
import webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'

import config from '../config/webpack.config.dev.js'

const compiler = WebpackDevServerUtils.createCompiler({
  webpack,
  config,
  appName: 'hatetris',
  urls: WebpackDevServerUtils.prepareUrls('http', 'localhost', 3000)
})

express()
  .use(WebpackDevMiddleware(compiler))
  .use(WebpackHotMiddleware(compiler))
  .listen(3000, () => {
    console.log('listening')
    console.log('http://localhost:3000/hatetris.html')
  })
