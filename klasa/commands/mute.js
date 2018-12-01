const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'mute',
      subcommands: true,
      usage: '<User:user>',
      permissionLevel: 6,
    })
  }

  run(msg, [user]) {
    if (user.id === msg.author.id || user.id === msg.client.user.id) return msg.sendLocale('_invalid_args')
    msg.guild.settings.update('mute', user.id, { action: 'add' })
    msg.sendLocale('_setconfig', ['mute'])
  }
}
