const util = require('../util')
const f = require('string-format')

module.exports.args = ['<Channel>']

module.exports.name = 'setignore'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  let channel
  if (msg.mentions.channels.first()) {
    channel = msg.mentions.channels.first()
  } else if (/\D/.test(args[1])) {
    channel = msg.guild.channels.find(n => n.name === args[1])
  } else if (/\d{18}/.test(args[1])) {
    try {
      channel = msg.guild.channels.get(args[1])
    } catch (e) {
      channel = msg.guild.channels.find(n => n.name === args[1])
    }
  } else {
    channel = msg.guild.channels.find(n => n.name === args[1])
  }
  if (!channel) return msg.channel.send(lang.invalid_args)
  const id = channel.id
  settings.excludeLogging = id
  await util.writeJSON(guildSettings, settings)
  await msg.channel.send(f(lang.setconfig, 'excludeLogging'))
}
