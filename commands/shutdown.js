const logger = require('../logger').getLogger('commands:shutdown', 'darkgray')
const f = require('string-format')

module.exports.name = 'shutdown'

module.exports.isAllowed = msg => {
  return msg.author.id == '254794124744458241'
}

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  if (args[1] == '-f') {
    logger.info(f(lang.atmpfs, msg.author.tag))
    msg.channel.send(lang.bye)
    client.destroy()
  } else if (args[1] == '-r') {
    (async () => {
      logger.info(f(lang.rebooting))
      await msg.channel.send(lang.rebooting)
      process.kill(process.pid, 'SIGKILL')
    })()
  } else {
    logger.info(f(lang.success, msg.content))
    msg.channel.send(lang.bye)
    client.destroy()
  }
}
