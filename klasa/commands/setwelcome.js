const Discord = require('discord.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setwelcome',
      subcommands: true,
      description: language => language.get('COMMAND_SETWELCOME_DESCRIPTION'),
      usage: '<channel|message> <Channel:channel|Message:str>',
      usageDelim: ' ',
      permissionLevel: 6,
    })
  }

  async message(msg, [message]) {
    if (typeof message !== 'string') return msg.sendLocale('_invalid_args')
    await msg.guild.settings.update('welcome_message', message)
    await msg.sendLocale('_setconfig', ['welcome_message'])
    msg.sendLocale('COMMAND_SETWELCOME_WARNING')
  }

  async channel(msg, [channel]) {
    if (!(channel instanceof Discord.TextChannel)) return msg.sendLocale('_invalid_args')
    await msg.guild.settings.update('welcome_channel', channel)
    await msg.sendLocale('_setconfig', ['welcome_channel'])
    msg.sendLocale('COMMAND_SETWELCOME_WARNING')
  }
}
