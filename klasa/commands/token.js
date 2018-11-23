const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'token',
      permissionLevel: 9,
    })
  }

  run(msg, settings, lang) {
    msg.author.send(f(lang.COMMAND_TOKEN_MYTOKEN, msg.client.token))
    msg.reply(lang.COMMAND_TOKEN_SENTTODM)
    msg.delete(5000)
  }
}
