const thinks = require('../../lib/thinks')

module.exports = (req, res) => {
  const images = thinks.all.map(think => `<p><img src="${think}" style="max-width: 800px"></p>`).join("<hr>")
  res.send(images)
  res.end()
}
