const Discord = require('discord.js')
const f = require('string-format')
const { validLanguages } = require(__dirname + '/../contents')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'language',
      args: [
        '[en|ja]',
      ],
      permissionLevel: 6,
    })
  }

  run(msg, settings, lang, args) {
    if (!args[1] || args[1] === 'help') {
      const embed = new Discord.MessageEmbed()
        .setTitle(f(lang.COMMAND_LANGUAGE_AVAILABLELANG, settings.language))
        .setDescription(validLanguages.join('\n'))
        .setColor([0,255,0])
      msg.channel.send(embed)
    } else if (validLanguages.includes(args[1])) {
      settings.language = args[1]
      msg.channel.send(f(lang._setconfig, 'language'))
    }
  }
}
