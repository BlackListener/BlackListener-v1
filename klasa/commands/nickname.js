const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      subcommands: true,
      usage: '<set|reset> <Member:member> (NewName:str)',
      aliases: ['nick'],
      permissionLevel: 6,
    })
  }

  set(msg, [member, name]) {
    if (!name) return msg.sendLocale('_invalid_args')
    member.setNickname(name)
  }

  reset(msg, [member]) {
    member.setNickname(null)
    return msg.channel.send(':ok_hand:')
  }
}
