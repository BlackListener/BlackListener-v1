const f = require('string-format')
const isTravisBuild = process.argv.includes('--travis-build')
const s = isTravisBuild ? require('../travis.yml') : require('../secret.yml')

module.exports.name = 'invite'

module.exports.run = async function(msg, settings, lang) {
  return msg.channel.send(f(lang.invite_bot, s.inviteme))
}
