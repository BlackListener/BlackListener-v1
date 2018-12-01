const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'shutdown',
      description: language => language.get('COMMAND_SHUTDOWN_DESCRIPTION'),
      permissionLevel: 9,
    })
  }

  async run(msg) {
    if (msg.content.includes('-f')) {
      if (/-(g|)f(g|)/gm.test(msg.content)) await msg.channel.send(':warning: Can\'t use graceful parameter; already set force option.')
      logger.warn(msg.language.get('COMMAND_SHUTDOWN_ATMPFS', msg.author.tag))
      await msg.sendLocale('COMMAND_SHUTDOWN_BYE')
      process.exit(0)
    } else if (/-(g|)r/gm.test(msg.content)) {
      logger.log('Restarting!')
      await msg.sendLocale('COMMAND_SHUTDOWN_REBOOTING')
      if (!/-(g|)r(g|)/gm.test(msg.content)) return process.kill(process.pid, 'SIGKILL')
      process.send('stop')
    } else {
      logger.log(msg.language.get('COMMAND_SHUTDOWN_SUCCESS', msg.content))
      msg.sendLocale('COMMAND_SHUTDOWN_BYE')
      if (!/-g/.test(msg.content)) return msg.client.destroy()
      process.send('stop')
    }
  }
}
