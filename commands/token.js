const Discord = require('discord.js')
const logger = require('../logger').getLogger('commands:token', 'cyan')
const f = require('string-format')

module.exports = function(msg, settings, lang) {
  if (msg.author.id === '254794124744458241') {
    logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
    msg.author.send(f(lang.mytoken, msg.client.token))
    msg.reply(lang.senttodm)
    const embed = new Discord.RichEmbed()
    embed.description = 'You\'ll need to set - add permission - \'Manage Messages\' => \'Save Changes\''
    embed.setColor([255, 0, 0])
    msg.delete(5000).catch(() => { msg.channel.send(':no_good: Missing permission: \'manage message\'', embed)
      logger.error('Error: missing \'manage message\' permission.')})
  } else {
    msg.reply(lang.youdonthavear)
    logger.info(f(lang.issuedfailadmin, msg.author.tag, msg.content, 'Doesn\'t have Admin Role'))
  }
  return true
}
