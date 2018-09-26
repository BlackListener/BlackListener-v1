const Discord = require('discord.js')
const f = require('string-format')

module.exports.args = ['<ja/en>']

module.exports.name = 'language'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang) {
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
    'es',
    'af',
    'ar',
    'el',
    'cs',
    'da',
    'de',
    'el',
  ]
  if (!args[1] || args[1] === 'help') {
    const embed = new Discord.MessageEmbed()
      .setTitle(lang.availablelang)
      .setDescription(validLanguages.join('\n'))
    msg.channel.send(embed)
  } else if (validLanguages.includes(args[1])) {
    settings.language = args[1]
    await msg.channel.send(f(lang.setconfig, 'language'))
  }
}
