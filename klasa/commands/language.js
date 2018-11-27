const Discord = require('discord.js')
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

  set(msg, [lang]) {
    if (!validLanguages.includes(lang)) return msg.send(msg.language.get('_invalid_args'))
    settings.language = lang
    msg.sendLocale('_setconfig', ['language'])
  }

  help(msg) {
    const embed = new Discord.MessageEmbed()
      .setTitle(msg.language.get('COMMAND_LANGUAGE_AVAILABLELANG', settings.language))
      .setDescription(validLanguages.join('\n'))
      .setColor([0,255,0])
    msg.channel.send(embed)
  }
}
