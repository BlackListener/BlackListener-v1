const f = require('string-format')
const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()
const argument_parser = require(__dirname + '/../argument_parser')
const util = require(__dirname + '/../../src/util')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'eval',
      usage: '<Code:str>',
      permissionLevel: 9,
    })
  }

  async run(msg) {
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
      logger.log(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${returned}`)
      if (!returned.includes('\n')) msg.channel.send(`:ok_hand: (${returned})`)
      else msg.channel.send(returned, { code: 'js' })
    } catch (e) {
      logger.log(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${lang.COMMAND_EVAL_ERROR} (${e})`)
      msg.channel.send(f(lang.COMMAND_EVAL_ERROR, e))
    }
  }
}
