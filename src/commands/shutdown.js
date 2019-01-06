const { commons: { f }, Command, LoggerFactory } = require('../core')
const logger = LoggerFactory.getLogger('commands:shutdown', 'darkgray')

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
      logger.warn(f(lang.atmpfs, msg.author.tag))
      await msg.channel.send(lang.bye)
      process.exit(0)
    } else if (/-(g|)r/gm.test(args[1])) {
      logger.info(f(lang.rebooting))
      await msg.channel.send(lang.rebooting)
      if (!/-(g|)r(g|)/gm.test(args[1])) return process.kill(process.pid, 'SIGKILL')
      process.send('stop')
    } else {
      logger.info(f(lang.success, msg.content))
      msg.channel.send(lang.bye)
      if (args[1] && !args[1].includes('-g')) return client.destroy()
      process.send('stop')
    }
  }
}
