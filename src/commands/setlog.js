const f = require('string-format')
const { Command } = require('../core')

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

  run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    let channel
    if (msg.mentions.channels.first()) {
      channel = msg.mentions.channels.first()
    } else if (/\D/.test(args[1])) {
      channel = msg.guild.channels.find(n => n.name === args[1])
    } else if (/\d{18}/.test(args[1])) {
      try {
        channel = msg.guild.channels.get(args[1])
      } catch (e) {
        channel = msg.guild.channels.find(n => n.name === args[1])
      }
    } else {
      channel = msg.guild.channels.find(n => n.name === args[1])
    }
    if (!channel) return msg.channel.send(lang.invalid_args)
    const id = channel.id
    settings.log_channel = id
    msg.channel.send(f(lang.setconfig, 'log_channel'))
  }
}
