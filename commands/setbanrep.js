const { setrep } = require('./functions')

module.exports.name = 'setbanrep'

module.exports.alias = ['banrep']

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  setrep(msg, lang, guildSettings, settings, false)
}
