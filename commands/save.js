const cs = require('../config/ConfigStore')

module.exports.name = 'save'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = function(msg, lang) {
  cs.write()
  msg.channel.send(lang.saved)
}