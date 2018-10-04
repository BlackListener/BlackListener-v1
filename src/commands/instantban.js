const { toUser } = require(__dirname + '/../converter.js')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<User>',
      ],
    }
    super('instantban', opts)
  }

  isAllowed(msg) {
    return msg.member.hasPermission(8)
  }

  run(msg, settings) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    const user = toUser(msg, args[1])
    msg.guild.ban(user)
    msg.channel.send(':ok_hand:')
  }
  
}
