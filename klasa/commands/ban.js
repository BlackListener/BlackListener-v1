const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()
const env = require('dotenv-safe').config({allowEmptyValues: true}).parsed
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'ban',
      usage: '<User:user> <Reason:str> <Probe:str>',
      permissionLevel: 6,
    })
  }

  async run(msg, [target, reason]) {
    const client = msg.client
    const flakeIdGen = new FlakeId({ epoch: 1514764800000 }) // 2018/1/1 0:00:00
    const generate = () => intformat(flakeIdGen.next(), 'dec')
    if (!target || !reason || !msg.attachments.first()) return msg.sendLocale('_invalid_args')
    const target_settings = target.settings
    if (target_settings.bannedFromServerOwner.includes(msg.guild.ownerID) && target_settings.bannedFromServer.includes(msg.guild.id) && target_settings.bannedFromUser.includes(msg.author.id))
      return msg.sendLocale('COMMAND_BAN_ALREADY_BANNED')
    const attach = msg.attachments.first().url
    if (client.user.id === target.id) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN_MYSELF')
    if (target.id === msg.author.id) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN_YOURSELF')
    if (env.OWNERS.includes(target.id)) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN_BOT_OWNERS')
    const member = msg.guild.member(target)
    if (!member && member.bannable) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN')
    target_settings.update('bannedFromServerOwner', msg.guild.ownerID)
    target_settings.update('bannedFromServer', msg.guild.id)
    target_settings.update('bannedFromUser', msg.author.id)
    target_settings.update('probes', attach)
    target_settings.update('reasons', reason)
    const id = generate()
    const bansdata = {
      id: id,
      userid: target.id,
      timestamp: Date.now(),
      guildId: msg.guild.id,
      executedUserId: msg.author.id,
      lostReps: 1,
    }
    client.settings.update('bans', bansdata)
    target_settings.update('rep', target_settings.rep + 1)
    await Promise.all(msg.client.guilds.map(async guild => {
      const banRep = guild.settings.banRep
      if (banRep !== 0 && banRep <= target_settings.rep) return await guild.ban(target)
      return Promise.resolve()
    }))
    logger.log(`Banned user: ${target.tag} (${target.id}) from ${msg.guild.name}(${msg.guild.id})`)
    return msg.channel.send(':white_check_mark: ' + msg.language.get('COMMAND_BAN_BANNED'))
  }
}
