const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setbanrep',
      args: [
        '<0...10>',
      ],
      aliases: [
        'banrep',
      ],
      permissionLevel: 6,
    })
  }

  run(msg, settings, lang, args) {
    const n = parseInt(args[1], 10)
    const min = 0
    const max = 10
    const status = n >= min && n <= max
    if (!status || args[1] == null) {
      msg.channel.send(lang._invalid_args)
    } else {
      settings.banRep = parseInt(args[1], 10)
      msg.channel.send(f(lang._setconfig, 'banRep'))
    }
  }
}
