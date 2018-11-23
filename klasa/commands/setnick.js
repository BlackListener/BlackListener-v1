const Converter = require(__dirname + '/../converter.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<NewName> [User]',
      ],
      alias: [
        'setnickname',
        'resetnick',
        'nick',
      ],
      permission: 8,
    }
    super('setnick', opts)
  }

  run(msg, settings, lang, args) {
    const cmd = args[0]
    if (cmd === 'resetnick') {
      const member = Converter.toMember(msg, args[1], msg.guild.me)
      member.setNickname(null)
      return msg.channel.send(':ok_hand:')
    } else {
      if (!args[1]) return msg.channel.send(lang._invalid_args)
      const member = Converter.toMember(msg, args[2], msg.guild.me)
      member.setNickname(args[1])
    }
  }
}
