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
      await msg.guild.settings.update('disable_purge', false)
    } else if (status === 'disable') {
      await msg.guild.settings.update('disable_purge', true)
    } else {
      await msg.guild.settings.update('disable_purge', !msg.guild.settings.disable_purge)
    }
    await msg.sendLocale('_setconfig', ['disable_purge'])
  }
}
