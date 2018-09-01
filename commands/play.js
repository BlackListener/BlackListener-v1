const util = require('../util')
const f = require('string-format')

module.exports.name = 'play'
module.exports.alias = ['music']

module.exports.run = async function(msg, settings, lang) {
  const s = await util.exists('./secret.yml') ? require('../secret.yml') : require('../travis.yml')
  return msg.channel.send(f(lang.musicbotis, s.musicinvite))
}
