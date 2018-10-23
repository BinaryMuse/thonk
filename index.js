require('dotenv').config()

const fs = require('fs')
const path = require('path')

const { WebClient } = require('@slack/client')
const bodyParser = require('body-parser')
const express = require('express')
const crpc = require('hubot-rpc-gen')
const request = require('request')
const uniqueRandom = require('unique-random')

const app = express()
const endpoint = crpc.endpoint(app, 'thonk', '/_chatops')
const web = new WebClient(process.env.SLACK_ACCESS_TOKEN || process.env.slack_access_token)

const thinks = fs.readFileSync(path.join(__dirname, 'thinks.txt'), 'utf8').split("\n").filter(item => !!item)
console.log(`Loaded ${thinks.length} thinks`)

const rand = uniqueRandom(0, thinks.length - 1)
const randomItem = () => thinks[rand()]

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.redirect('/random'))

app.get('/random', (req, res) => {
  const item = randomItem()
  const type = req.get('content-type') || 'text/html'

  switch (type) {
    case 'text/plain': {
      res.send(item)
      res.end()
      break
    }
    case 'application/json': {
      res.json({image: item})
      res.end()
      break
    }
    default: {
      res.send(`<img src="${item}">`)
      res.end()
      break
    }
  }
})

app.get('/all', (req, res) => {
  const images = thinks.map(think => `<p><img src="${think}" style="max-width: 800px"></p>`).join("<hr>")
  res.send(images)
  res.end()
})

// Slack stuff

function composeMessageWithActions (item) {
  item = item || randomItem()
  return {
    "attachments": [
      {
        "fallback": "Whatcha thinkin?",
        "pretext": "Whatcha thinkin?",
        "image_url": item,
        "callback_id": `think_me:${item}`,
        "actions": [
          {
            "name": "decision",
            "value": "accept",
            "style": "primary",
            "text": "Send Image",
            "type": "button"
          },
          {
            "name": "decision",
            "value": "random",
            "text": "Randomize",
            "type": "button"
          },
          {
            "name": "decision",
            "value": "cancel",
            "text": "Cancel",
            "type": "button"
          }
        ],
        "ts": new Date().getTime()
      }
    ]
  }
}

function composeMessageWithoutActions (item) {
  const message = composeMessageWithActions(item)
  delete message.attachments[0].actions
  delete message.attachments[0].callback_id
  // delete message.attachments[0].pretext
  message.attachments[0].pretext = '/think'
  message['response_type'] = 'in_channel'
  message.attachments[0].image_url = item
  return message
}

app.post('/slack/slash', (req, res) => {
  res.json(composeMessageWithActions())
  res.end()
})

app.post('/slack/action', (req, res, next) => {
  const payload = JSON.parse(req.body.payload)
  if (payload.callback_id.startsWith('think_me:')) {
    const item = payload.callback_id.substr(9)
    switch (payload.actions[0].value) {
      case 'cancel': {
        res.send('Okay, see you later!')
        break
      }
      case 'random': {
        res.json(composeMessageWithActions())
        break
      }
      case 'accept': {
        const channel = payload.channel.id
        const ts = payload.message_ts
        const msg = composeMessageWithoutActions(item)
        msg.channel = channel
        msg.as_user = true
        res.json({
          "text": "You got it!"
        })
        web.chat.postMessage(msg)
        break
      }
    }
  } else {
    next()
  }
})

// Hubot stuff

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
