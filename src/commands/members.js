const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('members')
  }

  run(msg) {
    return msg.channel.send(msg.guild.members.size)
  }
}
