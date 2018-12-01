const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'token',
      description: language => language.get('COMMAND_TOKEN_DESCRIPTION'),
      permissionLevel: 9,
    })
  }

  run(msg) {
    msg.author.send(msg.language.get('COMMAND_TOKEN_MYTOKEN', msg.client.token))
    msg.reply(msg.language.get('COMMAND_TOKEN_SENTTODM'))
    msg.delete(5000)
  }
}
