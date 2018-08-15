const util = require('../util')

module.exports = async function(settings, msg, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const set = settings
  if (/\s/gm.test(args[1]) || !args[1]) {
    msg.channel.send(lang.cannotspace)
  } else {
    set.prefix = args[1]
    await util.writeSettings(guildSettings, set, msg.channel, 'prefix')
  }
}
