const { WebClient } = require('@slack/client')

module.exports = function (app, randomItem) {
  const web = new WebClient(process.env.SLACK_ACCESS_TOKEN)

  function composeMessageWithActions (item) {
    item = item || randomItem()
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
    item = item || randomItem()
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

  function action_handler (req, res, next) {
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
          msg.as_user = false
          msg.attachments[0].pretext = `/think for ${payload.user.name}`
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
  }

  app.post('/slack/slash', slash_handler)
  app.post('/slack/action', action_handler)
}

