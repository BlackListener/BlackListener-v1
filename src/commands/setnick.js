const { Command, Converter } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<NewName> [User]',
      ],
      alias: [
        'nickname',
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
      if (/\s/gm.test(args[1]) || !args[1]) {
        msg.channel.send(lang.cannotspace)
      } else {
        const member = Converter.toMember(msg, args[2], msg.guild.me)
        member.setNickname(args[1])
      }
    }
  }
}
