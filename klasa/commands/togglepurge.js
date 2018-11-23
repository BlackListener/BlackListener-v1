const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    const opts = {
      args: [
        '[enable/disable]',
      ],
      permission: 8,
    }
    super(...args, 'togglepurge', opts)
  }

  async run(msg, settings, lang, args) {
    if (args[1] === 'enable') {
      settings.disable_purge = false
    } else if (args[1] === 'disable') {
      settings.disable_purge = true
    } else {
      if (settings.disable_purge) {
        settings.disable_purge = false
      } else if (!settings.disable_purge) {
        settings.disable_purge = true
      }
    }
    await msg.channel.send(f(lang._setconfig, 'disable_purge'))
  }
}
