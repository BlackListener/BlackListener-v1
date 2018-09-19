const f = require('string-format')

module.exports.args = ['<Prefix>']

module.exports.name = 'setprefix'

module.exports.alias = ['prefix']

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (/\s/gm.test(args[1]) || !args[1]) {
    msg.channel.send(lang.cannotspace)
  } else {
    settings.prefix = args[1]
    await msg.channel.send(f(lang.setconfig, 'prefix'))
  }
}
