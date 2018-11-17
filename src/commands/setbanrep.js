const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<0...10>',
      ],
      alias: [
        'banrep',
      ],
      permission: 8,
    }
    super('setbanrep', opts)
  }

  run(msg, settings, lang, args) {
    const n = parseInt(args[1], 10)
    const min = 0
    const max = 10
    const status = n >= min && n <= max
    if (!status || args[1] == null) {
      msg.channel.send(lang.invalid_args)
    } else {
      settings.banRep = parseInt(args[1], 10)
      msg.channel.send(f(lang.setconfig, 'banRep'))
    }
  }
}
