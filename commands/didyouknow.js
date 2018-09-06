const f = require('string-format')
const sendmsg = function(msg, args, know, lang, guild) {
  if (!know) {
    return msg.channel.send(f(lang.unknown, args[1]))
  } else {
    const name = guild ? know.name : know.tag
    return msg.channel.send(f(lang.known, `${name} (${know.id})`))
  }
}

module.exports.name = 'didyouknow'

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  if (args[2] === 'server') {
    let know = client.guilds.find('name', args[1])
    if (!know) know = client.guilds.get(args[1])
    sendmsg(msg, args, know, lang, true)
  }
  let know = client.users.find('username', args[1])
  if (!know) know = msg.mentions.users.first()
  if (!know) know = client.users.get(args[1])
  sendmsg(msg, args, know, lang, false)
}
