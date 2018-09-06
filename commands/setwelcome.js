const cs = require('../config/ConfigStore')
const logger = require('../logger').getLogger('commands:setwelcome', 'cyan')
const save = function(msg, lang, guildSettings, settings, message) {
  cs.store(guildSettings, settings)
  msg.channel.send(lang.setconfig, message)
  msg.channel.send(lang.welcome_warning)
}

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
    save(msg, lang, guildSettings, settings, 'welcome_message')
  } else if (args[1] === 'channel') {
    if (!args[2]) return msg.channel.send(lang.invalid_args)
    let channel
    try {
      channel = msg.guild.channels.find('name', args[2]).id || msg.guild.channels.get(args[2]).id || msg.mentions.channels.first().id
    } catch (e) {
      logger.error(e)
      return msg.channel.send(`${lang.invalid_args} (\`${e}\`)`)
    }
    settings.welcome_channel = channel
    save(msg, lang, guildSettings, settings, 'welcome_channel')
  } else {
    return msg.channel.send(lang.invalid_args)
  }
}
