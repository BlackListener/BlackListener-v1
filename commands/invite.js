const f = require('string-format')
const s = require('../secret.json5')

module.exports = function(msg, lang) {
  return msg.channel.send(f(lang.invite_bot, s.inviteme))
}
