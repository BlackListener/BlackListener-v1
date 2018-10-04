const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<Base64String>',
      ],
    }
    super('decode', opts)
  }

  run(msg, settings) {
    const cmd = settings.prefix + 'decode '
    return msg.channel.send(new Buffer.from(msg.content.slice(cmd.length), 'base64').toString('ascii'))
  }
}
