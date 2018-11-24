const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setnotifyrep',
      usage: '<rep:number{0,10}>',
      aliases: [
        'notifyrep',
      ],
      permissionLevel: 6,
    })
  }

  async run(msg) {
    const n = parseInt(args[1], 10)
    const min = 0
    const max = 10
    const status = n >= min && n <= max
    if (!status || args[1] == null) {
      msg.channel.send(lang._invalid_args)
    } else {
      settings.notifyRep = parseInt(args[1], 10)
      await msg.channel.send(f(lang._setconfig, 'notifyRep'))
    }
  }
}
