const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'mute',
      usage: '<User:user>',
      permissionLevel: 5,
    })
  }

  async run(msg, [user]) {
    await msg.guild.settings.update('mute', user.id, { action: 'remove' })
    msg.sendLocale('_setconfig', ['mute'])
  }
}
