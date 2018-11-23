const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('ping')
  }

  async run(msg, settings, lang) {
    const m = await msg.channel.send(lang.COMMAND_PING)
    m.edit(f(lang.COMMAND_PING_PONG, m.createdTimestamp - msg.createdTimestamp, Math.round(msg.client.ws.ping)))
  }
}
