const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'unban',
      usage: '<User:user>',
      permissionLevel: 6,
    })
  }

  async run(msg, [target]) {
    const bans = await data.bans()
    if (!bans.includes(target.id)) return msg.sendLocale('COMMAND_UNBAN_NOTFOUND_USER')
    const target_data = await data.user(target.id)
    target_data.rep = target_data.rep - 1
    bans.splice(bans.indexOf(target.id), 1) // FIXME
    logger.log(`Unbanned user: ${target.tag} (${target.id}) from ${msg.guild.name}(${msg.guild.id})`)
    await Promise.all(msg.client.guilds.map(async guild => {
      const { banRep } = await data.server(guild.id)
      if (banRep !== 0 && banRep > target_data.rep) return await guild.unban(target)
      return Promise.resolve()
    }))
    msg.sendLocale('COMMAND_UNBAN_UNBANNED')
  }
}
