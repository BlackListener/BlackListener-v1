const Converter = require(__dirname + '/../converter.js')
const Discord = require('discord.js')
const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'mute',
      args: [
        '<User>',
      ],
      permissionLevel: 6,
    })
  }

  run(msg, settings, lang, args) {
    const client = msg.client
    if (!args[1]) {
      const mutes = settings.mute.map((data) => {
        if (client.users.has(data)) {
          return `<@${data}> (${client.users.get(data).tag})`
        } else {
          return `<@${data}> ${data} (${lang._failed_to_get})`
        }
      })
      return msg.channel.send(new Discord.MessageEmbed()
        .setTitle(lang.COMMAND_MUTE_MUTED)
        .setDescription(mutes.join('\n') || lang._no)
      )
    }
    const user = Converter.toUser(msg, args[1])
    if (!user) return msg.channel.send(lang._invalid_args)
    if (user.id === msg.author.id || user.id === client.user.id) return msg.channel.send(lang._invalid_args)
    if (settings.mute.includes(user.id) || args[2] === 'unmute') {
      const result = settings.mute.filter(item => item !== user.id)
      settings.mute = result
    } else {
      settings.mute.push(user.id)
    }
    msg.channel.send(f(lang._setconfig, 'mute'))
  }
}
