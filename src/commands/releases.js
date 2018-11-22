const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[Version]',
      ],
    }
    super('releases', opts)
  }

  run(msg, settings, lang, args) {
    const versions = [
      '1.1',
      '1.1.1',
      '1.1.2',
      '1.2',
      '1.2.1',
    ]
    if (args[1] && !versions.includes(args[1])) return msg.channel.send(lang.COMMAND_RELEASES_INVALID_VERSION)
    if (args[1]) {
      return msg.channel.send(f(`http://go.blacklistener.tk/go/release_notes/${args[1]}`))
    } else {
      return msg.channel.send(f('http://go.blacklistener.tk/go/history'))
    }
  }
}
