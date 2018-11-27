const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'purge',
      usage: '<num:number{1,99}>',
      permissionLevel: 6,
    })
  }

  async run(msg, [num]) {
    if (settings.disable_purge) return msg.sendLocale('COMMAND_PURGE_DISABLED_PURGE')
    const messages = await msg.channel.fetchMessages({limit: num + 1})
    msg.channel.bulkDelete(messages)
      .catch(e => logger.error(e))
  }
}
