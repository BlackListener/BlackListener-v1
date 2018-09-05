const f = require('string-format')
const logger = require('../logger').getLogger('commands:autorole', 'green')
const cs = require('../config/ConfigStore')

module.exports.name = 'autorole'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (args[1] === 'remove') {
    settings.autorole = null
    cs.store(guildSettings, settings)
    msg.channel.send(f(lang.setconfig, 'autorole'))
  } else if (args[1] === 'add') {
    if (/\d{18,}/.test(args[2])) {
      settings.autorole = args[2]
    } else {
      try {
        const role = msg.mentions.roles.first().id.toString()
        settings.autorole = role
      } catch (e) {
        try {
          const role = msg.guild.roles.find('name', args[2]).id
          settings.autorole = role
        } catch (e) {
          msg.channel.send(lang.invalid_args)
          logger.error(e)
        }
      }
    }
    cs.store(guildSettings, settings)
    msg.channel.send(f(lang.setconfig, 'autorole'))
  } else {
    if (settings.autorole != null) {
      msg.channel.send(f(lang.autorole_enabled, msg.guild.roles.get(settings.autorole).name))
    } else if (!settings.autorole) {
      msg.channel.send(lang.autorole_disabled)
    }
  }
}
