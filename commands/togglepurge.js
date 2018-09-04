const cs = require('../config/ConfigStore')
const f = require('string-format')

module.exports.name = 'togglepurge'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const unsavedSettings = settings
  if (args[1] === 'enable') {
    unsavedSettings.disable_purge = false
  } else if (args[1] === 'disable') {
    unsavedSettings.disable_purge = true
  } else {
    if (settings.disable_purge) {
      unsavedSettings.disable_purge = false
    } else if (!settings.disable_purge) {
      unsavedSettings.disable_purge = true
    }
  }
  cs.store(guildSettings, unsavedSettings)
  msg.channel.send(f(lang.setconfig, 'disable_purge'))
}
