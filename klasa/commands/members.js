const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'members',
    })
  }

  async run(msg) {
    msg.channel.send(msg.guild.memberCount)
  }
}
