const cs = require('../config/ConfigStore')
const f = require('string-format')

module.exports = async function(settings, msg, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const set = settings
  if (/\s/gm.test(args[1]) || !args[1]) {
    msg.channel.send(lang.cannotspace)
  } else {
    set.prefix = args[1]
    cs.store(guildSettings, set)
    msg.channel.send(f(lang.setconfig, set))
  }
}
