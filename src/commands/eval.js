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

  async run(msg, settings, lang, args) {
    if (msg.content.includes('token')) return msg.channel.send(lang.udonthaveperm)
    !(async () => {
      if (args[1].includes('async:')) {
        args[1] = args[1].replace(/async:/g, '')
        return await eval(`(async () => {${args.slice(1).join(' ')}})()`)
      } else return await eval(args.slice(1).join(' '))
    })().then(data => {
      logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), Result: ${data}`)
      msg.channel.send(`:ok_hand: (${data})`)
    }).catch(e => {
      logger.info(`Eval[failed] by ${msg.author.tag} (${msg.author.id}), Result: \`${e.message}\``)
      msg.channel.send(f(lang.eval_error, `\`${e.message}\``))
    })
  }
}
