const f = require('string-format')
const util = require('../util')

module.exports = async function(msg, lang) {
  const s = await util.exists('./secret.yml') ? require('../secret.yml') : require('../travis.yml')
  return msg.channel.send(f(lang.invite_bot, s.inviteme))
}
