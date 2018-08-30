const util = require('../util')
const f = require('string-format')

module.exports.name = 'play'
module.exports.alias = ['music']

module.exports.run = async function(msg, settings, lang) {
  const s = await util.exists('./secret.json5') ? require('../secret.json5') : require('../travis.json5')
  return msg.channel.send(f(lang.musicbotis, s.musicinvite))
}
