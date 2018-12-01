const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'members',
      description: language => language.get('COMMAND_MEMBERS_DESCRIPTION'),
    })
  }

  async run(msg) {
    msg.channel.send(msg.guild.memberCount)
  }
}
