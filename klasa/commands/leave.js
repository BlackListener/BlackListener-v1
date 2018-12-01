const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'leave',
      permissionLevel: 7,
      description: language => language.get('COMMAND_LEAVE_DESCRIPTION'),
    })
  }

  async run(msg) {
    await msg.channel.send(':wave:')
    msg.guild.leave()
  }
}
