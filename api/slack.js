const { WebClient } = require('@slack/client')
const thinks = require('../lib/thinks')

const web = new WebClient(process.env.SLACK_ACCESS_TOKEN)

function composeMessageWithActions (item) {
  item = item || thinks.random()
  const msg = composeMessageWithoutActions(item)
  const attachment = msg.attachments[0]
  msg.response_type = "ephemeral"
  attachment.pretext = "Whatcha thinkin?"
  attachment.callback_id = `think_me:${item}`
  attachment.actions = [
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
  ]

  return msg
}

function composeMessageWithoutActions (item) {
  item = item || thinks.random()
  return {
    "response_type": "in_channel",
    "attachments": [
      {
        "fallback": "Whatcha thinkin?",
        "pretext": "/think",
        "image_url": item,
        "ts": new Date().getTime()
      }
    ]
  }
}

function slash_handler (req, res) {
  res.json(composeMessageWithActions())
  res.end()
}

function action_handler (req, res) {
  const payload = JSON.parse(req.body.payload)
  // console.log(payload)
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
        msg.as_user = false
        msg.attachments[0].pretext = `/think for ${payload.user.name}`
        msg.attachments[0].fallback = `/think for ${payload.user.name}`
        web.chat.postMessage(msg)
          .then(() => {
            res.json({
              "text": "You got it!"
            })
          }, (err) => {
            console.error(err)
            res.json({
              "text": "There was a problem."
            })
          })
        break
      }
    }
  } else {
    res.status(500)
    res.json({})
  }
}

module.exports = (req, res) => {
  if (req.query.type === 'slash') {
    slash_handler(req, res)
  } else if (req.query.type === 'action') {
    action_handler(req, res)
  } else {
    res.status(500)
    res.end('Invalid type')
  }
}
