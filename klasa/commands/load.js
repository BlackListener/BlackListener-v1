const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'load',
      args: '<Command:str>',
      permissionLevel: 9,
    })
  }

  run(msg, settings, lang) {
    const file = msg.content.slice((settings.prefix + 'load ').length)
    if (!file) return msg.channel.send(lang._invalid_args)
    require(__dirname + '/../commands.js').load(file)
    msg.channel.send(f(lang.COMMAND_LOAD_LOADED, file))
  }
}
