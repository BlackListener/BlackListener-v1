const Converter = require(__dirname + '/../converter.js')
const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'autorole',
      args: [
        '[add/remove] <Role>',
      ],
      permission: 8,
    })
  }

  run(msg, settings, lang, args) {
    if (args[1] === 'remove') {
      settings.autorole = null
      msg.channel.send(f(lang._setconfig, 'autorole'))
    } else if (args[1] === 'add') {
      if (/\d{18,}/.test(args[2])) {
        settings.autorole = args[2]
      } else {
        const role = Converter.toRole(msg, args[2])
        if (!role) msg.channel.send(lang._invalid_args)
        settings.autorole = role.id
      }
      msg.channel.send(f(lang._setconfig, 'autorole'))
    } else {
      if (settings.autorole != null) {
        msg.channel.send(f(lang.COMMAND_AUTOROLE_ENABLED, msg.guild.roles.get(settings.autorole).name))
      } else if (!settings.autorole) {
        msg.channel.send(lang.COMMAND_AUTOROLE_DISABLED)
      }
    }
  }
}
