const f = require('string-format')
const { loadSecret } = require('./functions')

module.exports.name = 'play'
module.exports.alias = ['music']

module.exports.run = async function(msg, settings, lang) {
  const s = await loadSecret()
  return msg.channel.send(f(lang.musicbotis, s.musicinvite))
}
