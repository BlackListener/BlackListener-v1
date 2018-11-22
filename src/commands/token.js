const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('token')
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  run(msg, settings, lang) {
    msg.author.send(f(lang.COMMAND_TOKEN_MYTOKEN, msg.client.token))
    msg.reply(lang.COMMAND_TOKEN_SENTTODM)
    msg.delete(5000)
  }
}
