const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'leave',
      permissionLevel: 7,
    })
  }

  async run(msg) {
    await msg.channel.send(':wave:')
    msg.guild.leave()
  }
}
