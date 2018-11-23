const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'members',
    })
  }

  async run(msg) {
    const message = await msg.channel.send('Fetching members...')
    await msg.guild.fetchMembers()
    message.edit(msg.guild.members.size)
  }
}
