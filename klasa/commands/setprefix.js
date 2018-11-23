const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setprefix',
      args: [
        '<Prefix>',
      ],
      alias: [
        'prefix',
      ],
      permissionLevel: 6,
    })
  }

  async run(msg, settings, lang, args) {
    if (/\s/gm.test(args[1]) || !args[1]) {
      msg.channel.send(lang.COMMAND_SETPREFIX_CANNOTSPACE)
    } else {
      settings.prefix = args[1]
      await msg.channel.send(f(lang._setconfig, 'prefix'))
    }
  }
}
