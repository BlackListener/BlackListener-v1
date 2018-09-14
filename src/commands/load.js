const f = require('string-format')

module.exports.args = ['[Command]']

module.exports.name = 'load'

module.exports.isAllowed = (msg, owners) => {
  return owners.includes(msg.author.id)
}

module.exports.run = function(msg, settings, lang) {
  const file = msg.content.slice((settings.prefix + 'load ').length)
  try {
    if (!file) throw new Error()
    require('../commands.js').load(file)
    msg.channel.send(f(lang.load.loaded, file))
  } catch (e) {
    msg.channel.send(f(lang.load.error, file))
  }
}
