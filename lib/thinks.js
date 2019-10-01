const fs = require('fs')
const path = require('path')
const uniqueRandom = require('unique-random')

const thinks = fs.readFileSync(path.join(__dirname, '..', 'thinks.txt'), 'utf8').split("\n").filter(item => !!item)
const rand = uniqueRandom(0, thinks.length - 1)
const randomItem = () => thinks[rand()]

module.exports = {
  all: thinks,
  random: randomItem
}
