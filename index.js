const fs = require('fs')
const path = require('path')

const express = require('express')
const crpc = require('hubot-rpc-gen')
const uniqueRandom = require('unique-random')

const app = express()
const endpoint = crpc.endpoint(app, 'thonk', '/_chatops')

const thinks = fs.readFileSync(path.join(__dirname, 'thinks.txt'), 'utf8').split("\n").filter(item => !!item)
console.log(`Loaded ${thinks.length} thinks`)

const rand = uniqueRandom(0, thinks.length - 1)
const randomItem = () => thinks[rand()]

app.get('/', (req, res) => res.redirect('/random'))

app.get('/random', (req, res) => {
  res.send(`<img src="${randomItem()}">`)
  res.end()
})

app.get('/all', (req, res) => {
  const images = thinks.map(think => `<p><img src="${think}" style="max-width: 800px"></p>`).join("<hr>")
  res.send(images)
  res.end()
})

endpoint.method('me', {
  help: 'me - generate a random thinky image',
  regex: 'me',
}, (opts, respond) => {
  try {
    respond(randomItem())
  } catch (err) {
    respond("Error choosing a random think!")
  }
})

const port = process.env.PORT || 8123
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
