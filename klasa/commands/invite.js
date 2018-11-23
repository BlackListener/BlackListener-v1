const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'invite',
      args: ['[patron]'],
    })
  }

  run(msg, settings, lang, args) {
    if (args[1] === 'patron') return msg.channel.send('Invite: https://discordapp.com/oauth2/authorize?client_id=' + msg.client.user.id + '&permissions=8&redirect_uri=https%3A%2F%2Fapi.rht0910.tk%2Fpatronbot&scope=bot&response_type=code')
    msg.channel.send(f(lang.COMMAND_INVITE_BOT, `https://discordapp.com/oauth2/authorize?client_id=${msg.client.user.id}&permissions=8&scope=bot`))
  }
}
