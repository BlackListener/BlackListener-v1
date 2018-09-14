const util = require('../util')

module.exports.name = 'setlog'

module.exports.alias = ['log']

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  let channel
  if (msg.mentions.channels.first()) {
    channel = msg.mentions.channels.first()
  } else if (/\D/.test(args[1])) {
    channel = msg.guild.channels.find('name', args[1])
  } else if (/\d{18}/.test(args[1])) {
    try {
      channel = msg.guild.channels.get(args[1])
    } catch (e) {
      channel = msg.guild.channels.find('name', args[1])
    }
  } else {
    channel = msg.guild.channels.find('name', args[1])
  }
  if (!channel) return msg.channel.send(lang.invalid_args)
  const id = channel.id
  settings.log_channel = id
  await util.writeSettings(guildSettings, settings, msg.channel, 'log_channel')
}
