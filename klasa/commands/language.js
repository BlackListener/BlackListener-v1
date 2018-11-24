const Discord = require('discord.js')
const f = require('string-format')
const { validLanguages } = require(__dirname + '/../contents')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'language',
      subcommands: true,
      usage: '<set:default|help> (en|ja)',
      permissionLevel: 6,
    })
  }

  set(msg) {
    if (!validLanguages.includes(args[1])) return msg.send(lang._invalid_args)
    settings.language = args[1]
    msg.channel.send(f(lang._setconfig, 'language'))
  }

  help() {
    const embed = new Discord.MessageEmbed()
      .setTitle(f(lang.COMMAND_LANGUAGE_AVAILABLELANG, settings.language))
      .setDescription(validLanguages.join('\n'))
      .setColor([0,255,0])
    msg.channel.send(embed)
  }
}
