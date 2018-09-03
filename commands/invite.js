const f = require('string-format')
const util = require('../util')

module.exports.name = 'invite'

module.exports.run = async function(msg, settings, lang) {
  const s = await util.exists('./secret.yml') ? require('../secret.yml') : require('../travis.yml')
  return msg.channel.send(f(lang.invite_bot, s.inviteme))
}
