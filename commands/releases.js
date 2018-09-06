const f = require('string-format')

module.exports.name = 'releases'

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const versions = [
    '1.1',
    '1.1.1',
    '1.1.2',
  ]
  if (args[1] && !versions.includes(args[1])) return msg.channel.send(lang.invalidVersion)
  if (args[1]) {
    return msg.channel.send(f(`http://go.blacklistener.tk/go/release_notes/${args[1]}`))
  } else {
    return msg.channel.send(f('http://go.blacklistener.tk/go/history'))
  }
}
