const Discord = require('discord.js')
const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setwelcome',
      subcommands: true,
      usage: '<channel|message> <Channel:channel|Message:str>',
      permissionLevel: 6,
    })
  }

  async message(msg, [message]) {
    if (typeof message !== 'string') return msg.channel.send(lang._invalid_args)
    const commandcut = msg.content.substr(`${settings.prefix}setwelcome message `.length)
    settings.welcome_message = commandcut
    await msg.channel.send(f(lang._setconfig, 'welcome_message'))
    msg.channel.send(lang.COMMAND_SETWELCOME_WARNING)
  }

  async channel(msg, [channel]) {
    if (!(channel instanceof Discord.TextChannel)) return msg.channel.send(lang._invalid_args)
    settings.welcome_channel = channel
    await msg.channel.send(f(lang._setconfig, 'welcome_channel'))
    msg.channel.send(lang.COMMAND_SETWELCOME_WARNING)
  }
}
