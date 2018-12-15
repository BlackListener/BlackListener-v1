const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[Command]',
      ],
    }
    super('load', opts)
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  run(msg, settings, lang) {
    const file = msg.content.slice((settings.prefix + 'load ').length)
    if (!file) return msg.channel.send(lang._invalid_args)
    require(__dirname + '/../commands').load(file)
      .then(() => msg.channel.send(f(lang.COMMAND_LOAD_LOADED, file)))
      .catch(e => msg.channel.send(f(lang._error, e.message)))
  }
}
