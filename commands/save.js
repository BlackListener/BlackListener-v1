const cs = require('../config/ConfigStore')

module.exports = function(msg, lang) {
  cs.write()
  msg.channel.send(lang.saved)
}