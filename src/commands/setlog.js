const { commons: { f }, Command, Converter } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      alias: [
        'log',
      ],
      permission: 8,
    }
    super('setlog', opts)
  }

  run(msg, settings, lang, args) {
    const channel = Converter.toTextChannel(msg, args[1])
    if (!channel) return msg.channel.send(lang.invalid_args)
    const id = channel.id
    settings.log_channel = id
    msg.channel.send(f(lang.setconfig, 'log_channel'))
  }
}
