const f = require('string-format')

module.exports.args = '<User:Guild> [:server]'

module.exports.name = 'didyouknow'

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  if (args[2] === 'server') {
    let know = client.guilds.find('name', args[1])
    if (!know) know = client.guilds.get(args[1])
    if (!know) {
      return msg.channel.send(f(lang.unknown, args[1]))
    } else {
      return msg.channel.send(f(lang.known, `${know.name} (${know.id})`))
    }
  }
  let know = client.users.find('username', args[1])
  if (!know) know = msg.mentions.users.first()
  if (!know) know = client.users.get(args[1])
  if (!know) {
    return msg.channel.send(f(lang.unknown, args[1]))
  } else {
    return msg.channel.send(f(lang.known, `${know.tag} (${know.id})`))
  }
}
