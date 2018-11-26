const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setnick',
      usage: '[NewName:str] [Member:member]',
      aliases: [
        'setnickname',
        'resetnick',
        'nick',
      ],
      permissionLevel: 6,
    })
  }

  run(msg, [name, member]) {
    if (cmd === 'resetnick') {
      member.setNickname(null)
      return msg.channel.send(':ok_hand:')
    } else {
      if (!name) return msg.channel.send(lang._invalid_args)
      member.setNickname(name)
    }
  }
}
