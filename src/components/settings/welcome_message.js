const { commons: { f }, Component, Converter } = require('../../core')

module.exports = class extends Component {
  constructor() {
    const opts = {
      args: ['message', 'channel'],
      permission: 8,
    }
    super('welcome_message', opts)
  }

  async _run(msg, settings, lang, args) {
    if (args[1] === 'message') {
      if (!args[2]) return msg.channel.send(lang.invalid_args)
      const commandcut = msg.content.substr(`${settings.prefix}settings welcomeMessage message `.length)
      settings.welcome_message = commandcut
      await msg.channel.send(f(lang.setconfig, 'welcome_message'))
      msg.channel.send(lang.welcome_warning)
    } else if (args[1] === 'channel') {
      const channel = Converter.toTextChannel(msg, args[2])
      if (!channel) return msg.channel.send(lang.invalid_args)
      settings.welcome_channel = channel
      await msg.channel.send(f(lang.setconfig, 'welcome_channel'))
      msg.channel.send(lang.welcome_warning)
    } else {
      msg.channel.send(`Your argument does not match: \`${this.args.join(', ')}\``)
    }
  }
}
