const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'unban',
      description: language => language.get('COMMAND_UNBAN_DESCRIPTION'),
      usage: '<User:user>',
      permissionLevel: 6,
    })
  }

  async run(msg, [target]) {
    if (!this.client.settings.bans.includes(target.id)) return msg.sendLocale('COMMAND_UNBAN_NOTFOUND_USER')
    const target_data = target.settings
    target_data.update('rep', target_data.rep - 1)
    this.client.settings.update('bans', target.id, { action: 'remove' })
    logger.log(`Unbanned user: ${target.tag} (${target.id}) from ${msg.guild.name}(${msg.guild.id})`)
    await Promise.all(msg.client.guilds.map(async guild => {
      const banRep = guild.settings.banRep
      if (banRep !== 0 && banRep > target_data.rep) return await guild.unban(target)
      return Promise.resolve()
    }))
    msg.sendLocale('COMMAND_UNBAN_UNBANNED')
  }
}
