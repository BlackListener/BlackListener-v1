const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<Prefix>',
      ],
      alias: [
        'prefix',
      ],
      permission: 8,
    }
    super('setprefix', opts)
  }

  async run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (/\s/gm.test(args[1]) || !args[1]) {
      msg.channel.send(lang.cannotspace)
    } else {
      settings.prefix = args[1]
      await msg.channel.send(f(lang.setconfig, 'prefix'))
    }
  }
}
