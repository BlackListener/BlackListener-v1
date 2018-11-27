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
    msg.sendLocale('_setconfig', ['excludeLogging'])
  }
}
