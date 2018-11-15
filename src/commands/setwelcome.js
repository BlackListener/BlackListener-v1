const Converter = require(__dirname + '/../converter.js')
const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[channel:message] [Channel:Message]',
      ],
      permission: 8,
    }
    super('setwelcome', opts)
  }

  async run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (args[1] === 'message') {
      if (!args[2]) return msg.channel.send(lang.invalid_args)
      const commandcut = msg.content.substr(`${settings.prefix}setwelcome message `.length)
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
      return msg.channel.send(lang.invalid_args)
    }
  }
}
