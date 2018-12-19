const { commons: { f }, Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('ping')
  }

  async run(msg, settings, lang) {
    const m = await msg.channel.send(lang.pinging)
    m.edit(f(lang.pong, m.createdTimestamp - msg.createdTimestamp, Math.round(msg.client.ping)))
  }
}
