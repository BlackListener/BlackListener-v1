const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setprefix',
      usage: '<Prefix:str>',
      aliases: [
        'prefix',
      ],
      permissionLevel: 6,
    })
  }

  async run(msg, [prefix]) {
    await msg.guild.settings.update('prefix', prefix)
    await msg.sendLocale('_setconfig', ['prefix'])
  }
}
