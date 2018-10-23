require('dotenv').config()

const fs = require('fs')
const path = require('path')

const express = require('express')
const uniqueRandom = require('unique-random')

const app = express()

const thinks = fs.readFileSync(path.join(__dirname, 'thinks.txt'), 'utf8').split("\n").filter(item => !!item)
console.log(`Loaded ${thinks.length} thinks`)

const rand = uniqueRandom(0, thinks.length - 1)
const randomItem = () => thinks[rand()]

require('./web')(app, thinks, randomItem)
require('./slack')(app, randomItem)
require('./hubot')(app, randomItem)

const port = process.env.PORT || 8123
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
