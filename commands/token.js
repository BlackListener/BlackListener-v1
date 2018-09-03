const Discord = require('discord.js')
const logger = require('../logger').getLogger('commands:token', 'cyan')
const f = require('string-format')

module.exports.name = 'token'

module.exports.isAllowed = msg => {
  return msg.author.id == '254794124744458241'
}

module.exports.run = function(msg, settings, lang) {
  msg.author.send(f(lang.mytoken, msg.client.token))
  msg.reply(lang.senttodm)
  msg.delete(5000).catch(() => {
    const embed = new Discord.RichEmbed()
    embed.description = 'You\'ll need to set - add permission - \'Manage Messages\' => \'Save Changes\''
    embed.setColor([255, 0, 0])
    msg.channel.send(':no_good: Missing permission: \'manage message\'', embed)
    logger.error('Error: missing \'manage message\' permission.')
  })
}
