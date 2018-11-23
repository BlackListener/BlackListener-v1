const Converter = require(__dirname + '/../converter')
const data = require(__dirname + '/../data')
const logger = require(__dirname + '/../logger').getLogger('commands:unban', 'blue')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    const opts = {
      args: [
        '<User>',
      ],
      permission: 8,
    }
    super(...args, 'unban', opts)
  }

  async run(msg, settings, lang, args) {
    const target = Converter.toUser(msg, args[1])
    if (!target) return msg.channel.send(lang.COMMAND_UNBAN_INVALID_USER)
    const bans = await data.bans()
    if (!bans.includes(target.id)) return msg.channel.send(lang.COMMAND_UNBAN_NOTFOUND_USER)
    const target_data = await data.user(target.id)
    target_data.rep = target_data.rep - 1
    bans.splice(bans.indexOf(target.id), 1) // FIXME
    logger.info(`Unbanned user: ${target.tag} (${target.id}) from ${msg.guild.name}(${msg.guild.id})`)
    await Promise.all(msg.client.guilds.map(async guild => {
      const { banRep } = await data.server(guild.id)
      if (banRep !== 0 && banRep > target_data.rep) return await guild.unban(target)
      return Promise.resolve()
    }))
    msg.channel.send(lang.COMMAND_UNBAN_UNBANNED)
  }
}
