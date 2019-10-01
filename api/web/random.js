const thinks = require('../../lib/thinks')

module.exports = (req, res) => {
  const item = thinks.random()
  const type = req.headers['content-type'] || 'text/html'

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
}
