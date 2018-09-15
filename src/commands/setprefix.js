const util = require('../util')
const f = require('string-format')

module.exports.args = ['<Prefix>']

module.exports.name = 'setprefix'

module.exports.alias = ['prefix']

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const set = settings
  if (/\s/gm.test(args[1]) || !args[1]) {
    msg.channel.send(lang.cannotspace)
  } else {
    set.prefix = args[1]
    await util.writeJSON(guildSettings, set)
    await msg.channel.send(f(lang.setconfig, 'prefix'))
  }
}
