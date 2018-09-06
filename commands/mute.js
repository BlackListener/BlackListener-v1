const Discord = require('discord.js')
const util = require('../util')

module.exports.name = 'mute'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  let user2
  if (!args[1]) {
    const mutes = settings.mute.map((data) => {
      if (client.users.has(data)) {
        return `<@${data}> (${client.users.get(data).tag})`
      } else {
        return `<@${data}> ${data} (${lang.failed_to_get})`
      }
    })
    return msg.channel.send(new Discord.RichEmbed()
      .setTitle(lang.serverinfo.mute)
      .addField(lang.serverinfo.mute, mutes.join('\n') || lang.no)
    )
  }
  try {
    user2 = client.users.find('username', args[1]).id
  } catch (e) {
    try {
      user2 = client.users.get(args[1]).id
    } catch (e) {
      try {
        user2 = msg.mentions.users.first().id
      } catch (e) {
        return msg.channel.send(lang.invalid_args)
      }
    }
  }
  if (!user2 || user2 === msg.author.id || user2 === client.user.id) return msg.channel.send(lang.invalid_args)
  if (settings.mute.includes(user2) || args[2] === 'unmute') {
    const result = settings.mute.filter( item => item !== user2)
    settings.mute = result
  } else if (args[2] === 'mute') {
    settings.mute.push(user2)
  } else {
    settings.mute.push(user2)
  }
  await util.writeSettings(guildSettings, settings, msg.channel, 'mute')
}
