const util = require('../util')
const logger = require('../logger').getLogger('commands:setwelcome', 'cyan')

module.exports.args = '[channel:message] [Channel:Message]'

module.exports.name = 'setwelcome'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (args[1] === 'message') {
    if (!args[2]) return msg.channel.send(lang.invalid_args)
    const commandcut = msg.content.substr(`${settings.prefix}setwelcome message `.length)
    settings.welcome_message = commandcut
    await util.writeSettings(guildSettings, settings, msg.channel, 'welcome_message')
    msg.channel.send(lang.welcome_warning)
  } else if (args[1] === 'channel') {
    if (!args[2]) return msg.channel.send(lang.invalid_args)
    let channel
    try {
      channel = msg.guild.channels.find(n => n.name === args[2]).id || msg.guild.channels.get(args[2]).id || msg.mentions.channels.first().id
    } catch (e) {
      try {
        channel = msg.guild.channels.get(args[2]).id
      } catch (e) {
        try {
          channel = msg.mentions.channels.first().id
        } catch (e) {
          logger.error(e)
          return msg.channel.send(`${lang.invalid_args} (\`${e}\`)`)
        }
      }
    }
    settings.welcome_channel = channel
    await util.writeSettings(guildSettings, settings, msg.channel, 'welcome_channel')
    msg.channel.send(lang.welcome_warning)
  } else {
    return msg.channel.send(lang.invalid_args)
  }
}
