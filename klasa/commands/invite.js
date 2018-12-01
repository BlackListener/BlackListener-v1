const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'invite',
      usage: '[patron]',
      description: language => language.get('COMMAND_INVITE_DESCRIPTION'),
    })
  }

  run(msg, [patron]) {
    if (patron) return msg.channel.send('Invite: https://discordapp.com/oauth2/authorize?client_id=' + msg.client.user.id + '&permissions=8&redirect_uri=https%3A%2F%2Fapi.rht0910.tk%2Fpatronbot&scope=bot&response_type=code')
    msg.sendLocale('COMMAND_INVITE_BOT', [`https://discordapp.com/oauth2/authorize?client_id=${msg.client.user.id}&permissions=8&scope=bot`])
  }
}
