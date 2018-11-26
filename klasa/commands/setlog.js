const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setlog',
      usage: '<Channel:channel>',
      aliases: [
        'log',
      ],
      permissionLevel: 6,
    })
  }

  run(msg, [channel]) {
    settings.log_channel = channel.id
    msg.channel.send(f(lang._setconfig, 'log_channel'))
  }
}
