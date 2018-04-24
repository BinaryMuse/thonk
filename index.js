const express = require('express')
const crpc = require('hubot-rpc-gen')

const app = express()
const endpoint = crpc.endpoint(app, 'thonk', '/_chatops')

const thinks = [
  "https://i.imgur.com/Xw6ct8l.png?1",
  "https://i.imgur.com/uel3jYM.png",
  "https://i.imgur.com/L3TV5XJ.jpg",
  "https://i.imgur.com/AaSMv71.gif",
  "https://i.imgur.com/9I2Qh6t.gif",
  "https://i.imgur.com/PrunYus.png",
  "https://i.imgur.com/SmPXo67.jpg",
  "https://i.imgur.com/YCGbIFV.png",
  "https://i.redd.it/ys859qr27m9z.png",
  "https://i.imgur.com/Hk3zD4B.png",
  "https://i.imgur.com/Kt2b8U9.gif",
  "https://i.imgur.com/XlX03te.png",
  "https://i.imgur.com/bO5y33W.png",
  "http://i.imgur.com/o7EsvoS.gif",
  "https://i.imgur.com/2lqsWvg.png",
  "http://i.imgur.com/tKgUWaf.jpg",
  "https://i.imgur.com/o2EZU5u.png",
  "https://i.imgur.com/DMAMVhV.png"
]

endpoint.method('me', {
  help: 'me',
  regex: 'me',
}, (opts, respond) => {
  const rand = thinks[Math.floor(Math.random() * thinks.length)];
  respond(rand);
})

const port = process.env.PORT || 8123
app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
