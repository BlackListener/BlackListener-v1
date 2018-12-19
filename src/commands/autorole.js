const { commons: { f }, Command, Converter } = require('../core')

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

  run(msg, settings, lang, args) {
    if (args[1] === 'remove') {
      settings.autorole = null
      msg.channel.send(f(lang.setconfig, 'autorole'))
    } else if (args[1] === 'add') {
      const role = Converter.toRole(msg, args[2])
      if (!role) return msg.channel.send(lang.invalid_args)
      settings.autorole = role.id
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
