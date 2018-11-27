const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'releases',
      usage: '[Version:str]',
    })
  }

  run(msg, [version]) {
    const versions = [
      '1.1',
      '1.1.1',
      '1.1.2',
      '1.2',
      '1.2.1',
    ]
    if (version && !versions.includes(version)) return msg.sendLocale('COMMAND_RELEASES_INVALID_VERSION')
    if (version) {
      return msg.channel.send(`http://go.blacklistener.tk/go/release_notes/${version}`)
    } else {
      return msg.channel.send('http://go.blacklistener.tk/go/history')
    }
  }
}
