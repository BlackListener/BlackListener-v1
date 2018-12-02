const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setignore',
      description: language => language.get('COMMAND_SETIGNORE_DESCRIPTION'),
      usage: '<Channel:channel>',
      permissionLevel: 5,
    })
  }

  async run(msg, [channel]) {
    await msg.guild.settings.update('excludeLogging', channel.id)
    msg.sendLocale('_setconfig', ['excludeLogging'])
  }
}
