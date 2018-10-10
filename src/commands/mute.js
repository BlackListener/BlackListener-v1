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

  run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
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
    let user2
    try {
      user2 = client.users.find(n => n.username === args[1]).id
    } catch (e) {
      try {
        user2 = client.users.get(args[1]).id
      } catch (e) {
        try {
          user2 = msg.mentions.users.first().id
        } catch (e) {
          return msg.channel.send(lang.invalid_args)
        }
      }
    }
    if (!user2 || user2 === msg.author.id || user2 === client.user.id) return msg.channel.send(lang.invalid_args)
    if (settings.mute.includes(user2) || args[2] === 'unmute') {
      const result = settings.mute.filter( item => item !== user2)
      settings.mute = result
    } else if (args[2] === 'mute') {
      settings.mute.push(user2)
    } else {
      settings.mute.push(user2)
    }
    msg.channel.send(f(lang.setconfig, 'mute'))
  }
}
