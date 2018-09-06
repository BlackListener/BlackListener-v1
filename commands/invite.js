const f = require('string-format')
const { loadSecret } = require('./functions')

module.exports.name = 'invite'

module.exports.run = async function(msg, settings, lang) {
  const s = await loadSecret()
  return msg.channel.send(f(lang.invite_bot, s.inviteme))
}
