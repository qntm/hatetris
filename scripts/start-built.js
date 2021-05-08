const express = require('express')

express()
  .use(express.static('./dist'))
  .listen(3000, () => {
    console.log('listening')
    console.log('http://localhost:3000/hatetris.html')
  })
