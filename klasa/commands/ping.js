const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'ping',
    })
  }

  async run(msg) {
    const m = await msg.channel.send(lang.COMMAND_PING)
    m.edit(f(lang.COMMAND_PING_PONG, m.createdTimestamp - msg.createdTimestamp, Math.round(msg.client.ws.ping)))
  }
}
