const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('members')
  }

  async run(msg) {
    const message = await msg.channel.send('Fetching members...')
    await msg.guild.fetchMembers()
    message.edit(msg.guild.members.size)
  }
}
