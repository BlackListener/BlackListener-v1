const util = require('../util')
const f = require('string-format')

module.exports.args = ['[enable/disable]']

module.exports.name = 'togglepurge'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (args[1] === 'enable') {
    settings.disable_purge = false
  } else if (args[1] === 'disable') {
    settings.disable_purge = true
  } else {
    if (settings.disable_purge) {
      settings.disable_purge = false
    } else if (!settings.disable_purge) {
      settings.disable_purge = true
    }
  }
  await util.writeJSON(guildSettings, settings)
  await msg.channel.send(f(lang.setconfig, 'disable_purge'))
}
