const thinks = require('../lib/thinks')
const crpc = require('../lib/now-hubot-rpc-gen')

const endpoint = new crpc.Endpoint('thonk')

endpoint.method('me', {
  help: 'me - generate a random thinky image',
  regex: 'me',
}, (opts, respond) => {
  try {
    respond(thinks.random())
  } catch (err) {
    respond("Error choosing a random think!")
  }
})

module.exports = endpoint.respond

