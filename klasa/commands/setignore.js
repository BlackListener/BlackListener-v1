const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setignore',
      usage: '<Channel:channel>',
      permissionLevel: 6,
    })
  }

  async run(msg, [channel]) {
    await msg.guild.settings.update('excludeLogging', channel.id)
    msg.sendLocale('_setconfig', ['excludeLogging'])
  }
}
