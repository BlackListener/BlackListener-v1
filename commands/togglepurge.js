const util = require('../util')

module.exports = async function(msg, settings, lang, guildSettings) {
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
  await util.writeSettings(guildSettings, unsavedSettings, msg.channel, 'disable_purge')
}
