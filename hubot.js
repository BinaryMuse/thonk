const crpc = require('hubot-rpc-gen')

module.exports = function (app, randomItem) {
  const endpoint = crpc.endpoint(app, 'thonk', '/_chatops')

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
}
