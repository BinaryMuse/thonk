const bodyParser = require('body-parser')

module.exports = function (app, thinks, randomItem) {
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
}
