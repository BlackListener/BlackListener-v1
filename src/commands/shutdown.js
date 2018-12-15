const logger = require(__dirname + '/../logger').getLogger('commands:shutdown', 'darkgray')
const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[-f]',
        '[-r[g]]',
        '[-g]',
      ],
    }
    super('shutdown', opts)
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  async run(msg, settings, lang, args) {
    const client = msg.client
    if (~args.indexOf('-f')) {
      if (/-(g|)f(g|)/gm.test(args[1])) await msg.channel.send(':warning: Can\'t use graceful parameter; already set force option.')
      logger.warn(f(lang.COMMAND_SHUTDOWN_ATMPFS, msg.author.tag))
      await msg.channel.send(lang.COMMAND_SHUTDOWN_BYE)
      process.exit(0)
    } else if (/-(g|)r/gm.test(args[1])) {
      logger.info(f(lang.COMMAND_SHUTDOWN_REBOOTING))
      await msg.channel.send(lang.COMMAND_SHUTDOWN_REBOOTING)
      if (!/-(g|)r(g|)/gm.test(args[1])) return process.kill(process.pid, 'SIGKILL')
      process.send('stop')
    } else {
      logger.info(f(lang.COMMAND_SHUTDOWN_SUCCESS, msg.content))
      msg.channel.send(lang.COMMAND_SHUTDOWN_BYE)
      if (!args[1].includes('-g')) return client.destroy()
      process.send('stop')
    }
  }
}
