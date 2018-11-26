const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'autorole',
      subcommands: true,
      usage: '<add|remove|show:default> [Role:role]',
      permissionLevel: 6,
    })
  }

  add(msg, [role]) {
    if (!role) msg.channel.send(lang._invalid_args)
    settings.autorole = role.id
    msg.channel.send(f(lang._setconfig, 'autorole'))
  }

  remove(msg) {
    settings.autorole = null
    msg.channel.send(f(lang._setconfig, 'autorole'))
  }

  show(msg) {
    if (settings.autorole != null) {
      msg.channel.send(f(lang.COMMAND_AUTOROLE_ENABLED, msg.guild.roles.get(settings.autorole).name))
    } else if (!settings.autorole) {
      msg.channel.send(lang.COMMAND_AUTOROLE_DISABLED)
    }
  }
}
