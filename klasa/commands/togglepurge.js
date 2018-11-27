const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'togglepurge',
      usage: '[enable|disable]',
      permissionLevel: 6,
    })
  }

  async run(msg, [status]) {
    if (status === 'enable') {
      settings.disable_purge = false
    } else if (status === 'disable') {
      settings.disable_purge = true
    } else {
      settings.disable_purge = !settings.disable_purge
    }
    await msg.sendLocale('_setconfig', ['disable_purge'])
  }
}
