const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, 'leave')
  }

  isAllowed(msg) {
    return msg.author.id === msg.guild.ownerID
  }

  async run(msg) {
    await msg.channel.send(':wave:')
    msg.guild.leave()
  }
}
