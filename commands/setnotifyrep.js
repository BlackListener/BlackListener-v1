const cs = require('../config/ConfigStore')
const f = require('string-format')

module.exports.name = 'setnotifyrep'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const set = settings
  const n = parseInt(args[1], 10)
  const min = 0
  const max = 10
  const status = n >= min && n <= max
  if (!status || args[1] == null) {
    msg.channel.send(lang.invalid_args)
  } else {
    set.notifyRep = parseInt(args[1], 10)
    cs.store(guildSettings, set)
    msg.channel.send(f(lang.setconfig, 'notifyRep'))
  }
}
