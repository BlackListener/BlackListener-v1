const f = require('string-format')
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
    if (/\s/.test(prefix) || !prefix) {
      msg.channel.send(lang.COMMAND_SETPREFIX_CANNOTSPACE)
    } else {
      settings.prefix = prefix
      await msg.channel.send(f(lang._setconfig, 'prefix'))
    }
  }
}
