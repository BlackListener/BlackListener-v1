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
    try {
      if (!file) throw new Error()
      require(__dirname + '/../commands.js').load(file)
      msg.channel.send(f(lang.load.loaded, file))
    } catch (e) {
      msg.channel.send(f(lang.load.error, file))
    }
  }
}
