const util = require('../util')
const Discord = require('discord.js')

module.exports.args = ['<ja/en>']

module.exports.name = 'language'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const validLanguages = [
    'en',
    'ja',
    'ca',
    'fi',
    'fr',
    'he',
    'hu',
    'it',
    'ko',
    'nl',
    'no',
    'pl',
    'pt',
    'ro',
    'sr',
    'ru',
    'sv',
    'tr',
    'uk',
    'vi',
    'zh',
  ]
  if (!args[1] || args[1] === 'help') {
    const embed = new Discord.RichEmbed()
      .setTitle(lang.availablelang)
      .setDescription(validLanguages.join('\n'))
    msg.channel.send(embed)
  } else if (validLanguages.includes(args[1])) {
    settings.language = args[1]
    await util.writeSettings(guildSettings, settings, msg.channel, 'language')
  }
}
