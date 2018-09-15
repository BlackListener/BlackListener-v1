const f = require('string-format')

module.exports.args = ['<0...10>']

module.exports.name = 'setbanrep'

module.exports.alias = ['banrep']

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const n = parseInt(args[1], 10)
  const min = 0
  const max = 10
  const status = n >= min && n <= max
  if (!status || args[1] == null) {
    msg.channel.send(lang.invalid_args)
  } else {
    settings.banRep = parseInt(args[1], 10)
    await msg.channel.send(f(lang.setconfig, 'banRep'))
  }
}
