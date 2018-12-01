const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'autorole',
      subcommands: true,
      usage: '<add|remove|show:default> [Role:role]',
      usageDelim: ' ',
      permissionLevel: 6,
    })
  }

  async add(msg, [role]) {
    if (!role) msg.sendLocale('_invalid_args')
    await msg.guild.settings.update('autorole', role.id)
    msg.sendLocale('_setconfig', ['autorole'])
  }

  async remove(msg) {
    await msg.guild.settings.update('autorole', null)
    msg.sendLocale('_setconfig', ['autorole'])
  }

  show(msg) {
    const settings = msg.guild.settings
    if (settings.autorole != null) {
      msg.sendLocale('COMMAND_AUTOROLE_ENABLED', [msg.guild.roles.get(settings.autorole).name])
    } else if (!settings.autorole) {
      msg.sendLocale('COMMAND_AUTOROLE_DISABLED')
    }
  }
}
