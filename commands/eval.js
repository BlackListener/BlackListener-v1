const logger = require('../logger').getLogger('commands:eval', 'lightpurple')
const f = require('string-format')

module.exports = function(settings, msg, lang) {
  if (msg.author.id !== '254794124744458241' || msg.content.includes('token')) return msg.channel.send(lang.udonthaveperm)
  const commandcut = msg.content.substr(`${settings.prefix}eval `.length)
  try {
    const returned = msg.client._eval(commandcut)
    logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${returned}`)
    msg.channel.send(`:ok_hand: (${returned})`)
  } catch (e) {
    logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${lang.eval_error} (${e})`)
    msg.channel.send(f(lang.eval_error, e))
  }
}
