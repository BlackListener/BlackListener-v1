const s = require('../secret.json5')
const f = require('string-format')

module.exports = function(msg, lang) {
  return msg.channel.send(f(lang.musicbotis, s.musicinvite))
}
