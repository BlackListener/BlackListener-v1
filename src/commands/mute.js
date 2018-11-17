const Converter = require(__dirname + '/../converter.js')
const Discord = require('discord.js')
const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<User>',
      ],
      permission: 8,
    }
    super('mute', opts)
  }

  run(msg, settings, lang, args) {
    const client = msg.client
    if (!args[1]) {
      const mutes = settings.mute.map((data) => {
        if (client.users.has(data)) {
          return `<@${data}> (${client.users.get(data).tag})`
        } else {
          return `<@${data}> ${data} (${lang.failed_to_get})`
        }
      })
      return msg.channel.send(new Discord.RichEmbed()
        .setTitle(lang.serverinfo.mute)
        .addField(lang.serverinfo.mute, mutes.join('\n') || lang.no)
      )
    }
    const user = Converter.toUser(msg, args[1])
    if (!user) return msg.channel.send(lang.invalid_args)
    if (user.id === msg.author.id || user.id === client.user.id) return msg.channel.send(lang.invalid_args)
    if (settings.mute.includes(user.id) || args[2] === 'unmute') {
      const result = settings.mute.filter(item => item !== user.id)
      settings.mute = result
    } else {
      settings.mute.push(user.id)
    }
    msg.channel.send(f(lang.setconfig, 'mute'))
  }
}
