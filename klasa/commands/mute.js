const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'mute',
      subcommands: true,
      usage: '<User:user>',
      permissionLevel: 6,
    })
  }

  async run(msg, [user]) {
    const data = msg.client.providers.get('json')
    if (user.id === msg.author.id || user.id === msg.client.user.id) return msg.sendLocale('_invalid_args');
    (await data.get('guilds', msg.guild.id).mute || []).push(user.id)
    msg.sendLocale('_setconfig', ['mute'])
  }
}
