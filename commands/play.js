const f = require('string-format')
const isTravisBuild = process.argv[2] === '--travis-build'
const s = isTravisBuild ? require('../travis.yml') : require('../secret.yml')

module.exports.name = 'play'

module.exports.alias = ['music']

module.exports.run = async function(msg, settings, lang) {
  return msg.channel.send(f(lang.musicbotis, s.musicinvite))
}
