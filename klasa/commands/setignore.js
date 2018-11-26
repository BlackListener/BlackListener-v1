const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setignore',
      usage: '<Channel:channel>',
      permissionLevel: 6,
    })
  }

  run(msg, [channel]) {
    settings.excludeLogging = channel.id
    msg.channel.send(f(lang._setconfig, 'excludeLogging'))
  }
}
