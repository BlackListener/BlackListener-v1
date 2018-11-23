const logger = require(__dirname + '/../logger').getLogger('commands:eval', 'lightpurple')
const f = require('string-format')
const { Command } = require('klasa')
const argument_parser = require(__dirname + '/../argument_parser')
const util = require(__dirname + '/../util')

module.exports = class extends Command {
  constructor(...args) {
    const opts = {
      args: ['<Code>'],
    }
    super(...args, 'eval', opts)
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  async run(msg, settings, lang, args) {
    const opts = argument_parser(args.slice(1))
    if (msg.content.includes('token')) return msg.channel.send(lang._udonthaveperm)
    const commandcut = args.slice(Object.values(opts).length + 1).join(' ')
    try { // eslint-disable-line
      let returned
      if (opts.run_as) {
        if (util.exists(__dirname + '/' + opts.run_as)) {
          const Run = require(__dirname + '/' + opts.run_as)
          returned = await (new Run())._eval(commandcut)
        } else throw new ReferenceError('Not found specified command.')
      } else {
        returned = await (eval(`(async () => {${commandcut}})()`))
      }
      logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${returned}`)
      if (!returned.includes('\n')) msg.channel.send(`:ok_hand: (${returned})`)
      else msg.channel.send(returned, { code: 'js' })
    } catch (e) {
      logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${lang.COMMAND_EVAL_ERROR} (${e})`)
      msg.channel.send(f(lang.COMMAND_EVAL_ERROR, e))
    }
  }
}
