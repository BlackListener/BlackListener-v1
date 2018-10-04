const logger = require(__dirname + '/../logger').getLogger('commands:eval', 'lightpurple')
const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: ['<Code>'],
    }
    super('eval', opts)
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  async run(msg, settings, lang) {
    if (msg.content.includes('token')) return msg.channel.send(lang.udonthaveperm)
    const commandcut = msg.content.substr(`${settings.prefix}eval `.length)
    try {
      const returned = await (eval(`(async () => {${commandcut}})()`))
      logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${returned}`)
      msg.channel.send(`:ok_hand: (${returned})`)
    } catch (e) {
      logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${lang.eval_error} (${e})`)
      msg.channel.send(f(lang.eval_error, e))
    }
  }
}
