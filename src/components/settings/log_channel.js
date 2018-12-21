const { commons: { f }, Component, Converter } = require('../../core')

module.exports = class extends Component {
  constructor() {
    super('log_channel', { permission: 8 })
  }

  _run(msg, settings, lang, args) {
    const channel = Converter.toTextChannel(msg, args[1])
    if (!channel) return msg.channel.send(lang.invalid_args)
    const id = channel.id
    settings.log_channel = id
    msg.channel.send(f(lang.setconfig, 'log_channel'))
  }
}
