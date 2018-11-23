const Converter = require(__dirname + '/../converter.js')
const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<Channel>',
      ],
      permission: 8,
    }
    super('setignore', opts)
  }

  run(msg, settings, lang, args) {
    const channel = Converter.toTextChannel(msg, args[1])
    if (!channel) return msg.channel.send(lang._invalid_args)
    const id = channel.id
    settings.excludeLogging = id
    msg.channel.send(f(lang._setconfig, 'excludeLogging'))
  }
}
