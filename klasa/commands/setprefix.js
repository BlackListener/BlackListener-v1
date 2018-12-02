const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setprefix',
      description: language => language.get('COMMAND_SETPREFIX_DESCRIPTION'),
      usage: '<Prefix:str>',
      aliases: [
        'prefix',
      ],
      permissionLevel: 5,
    })
  }

  async run(msg, [prefix]) {
    await msg.guild.settings.update('prefix', prefix)
    await msg.sendLocale('_setconfig', ['prefix'])
  }
}
