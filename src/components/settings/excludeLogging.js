const { commons: { f }, Component, Converter } = require('../../core')

module.exports = class extends Component {
  constructor() {
    super('excludeLogging', { permission: 8 })
  }

  _run(msg, settings, lang, args) {
    const channel = Converter.toTextChannel(msg, args[1])
    if (!channel) return msg.channel.send('Please specify text channel.')
    const id = channel.id
    settings.excludeLogging = id
    msg.channel.send(f(lang.setconfig, 'excludeLogging'))
  }
}
