const f = require('string-format')
const logger = require(__dirname + '/../logger').getLogger('commands:autorole', 'green')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[add/remove] <Role>',
      ],
      permission: 8,
    }
    super('autorole', opts)
  }

  run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (args[1] === 'remove') {
      settings.autorole = null
      msg.channel.send(f(lang.setconfig, 'autorole'))
    } else if (args[1] === 'add') {
      if (/\d{18,}/.test(args[2])) {
        settings.autorole = args[2]
      } else {
        try {
          settings.autorole = msg.mentions.roles.first().id.toString() || msg.guild.roles.find(n => n.name === args[2]).id
        } catch(e) {
          msg.channel.send(lang.invalid_args); logger.warn(e)
        }
      }
      msg.channel.send(f(lang.setconfig, 'autorole'))
    } else {
      if (settings.autorole != null) {
        msg.channel.send(f(lang.autorole_enabled, msg.guild.roles.get(settings.autorole).name))
      } else if (!settings.autorole) {
        msg.channel.send(lang.autorole_disabled)
      }
    }
  }
}
