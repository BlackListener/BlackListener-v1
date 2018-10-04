const Discord = require('discord.js')
const f = require('string-format')
const { validLanguages } = require(__dirname + '/../contents')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        'ISO 639-1 Language Code(en, ja, and more)',
      ],
    }
    super('language', opts)
  }

  isAllowed(msg) {
    return msg.member.hasPermission(8)
  }

  run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (!args[1] || args[1] === 'help') {
      const embed = new Discord.RichEmbed()
        .setTitle(f(lang.availablelang, settings.language))
        .setDescription(validLanguages.join('\n'))
        .setColor([0,255,0])
      msg.channel.send(embed)
    } else if (validLanguages.includes(args[1])) {
      settings.language = args[1]
      msg.channel.send(f(lang.setconfig, 'language'))
    }
  }
}
