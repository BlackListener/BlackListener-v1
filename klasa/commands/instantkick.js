const Converter = require(__dirname + '/../converter.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'instantkick',
      args: [
        '<User>',
      ],
      permission: 8,
    })
  }

  run(msg, settings, lang, args) {
    if (!args[1]) return msg.channel.send(lang._invalid_args)
    const user = Converter.toUser(msg, args[1])
    msg.guild.members.get(user.id).kick('Instant Kick by BlackListener by ' + msg.author.tag)
    msg.channel.send(':ok_hand:')
  }
}
