const { commons: { f }, Command, Converter } = require('../core')

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
    if (!channel) return msg.channel.send(lang.invalid_args)
    const id = channel.id
    settings.excludeLogging = id
    msg.channel.send(f(lang.setconfig, 'excludeLogging'))
  }
}
