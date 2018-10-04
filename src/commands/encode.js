const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<String>',
      ],
    }
    super('encode', opts)
  }

  run(msg, settings) {
    const cmd = settings.prefix + 'encode '
    return msg.channel.send(new Buffer.from(msg.content.slice(cmd.length)).toString('base64'))
  }  
}
