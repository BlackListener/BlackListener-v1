const data = require(__dirname + '/../data')
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
    const bans = await data.bans()
    const flakeIdGen = new FlakeId({ epoch: 1514764800000 }) // 2018/1/1 0:00:00
    const generate = () => intformat(flakeIdGen.next(), 'dec')
    if (!target || !reason || !msg.attachments.first()) return msg.sendLocale('_invalid_args')
    const target_data = await data.user(target.id)
    if (target_data.bannedFromServerOwner.includes(msg.guild.ownerID) && target_data.bannedFromServer.includes(msg.guild.id) && target_data.bannedFromUser.includes(msg.author.id))
      return msg.sendLocale('COMMAND_BAN_ALREADY_BANNED')
    const attach = msg.attachments.first().url
    if (client.user.id === target.id) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN_MYSELF')
    if (target.id === msg.author.id) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN_YOURSELF')
    if (env.OWNERS.includes(target.id)) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN_BOT_OWNERS')
    const member = msg.guild.member(target)
    if (!member && member.bannable) return msg.sendLocale('COMMAND_BAN_CANNOT_BAN')
    target_data.bannedFromServerOwner.push(msg.guild.ownerID)
    target_data.bannedFromServer.push(msg.guild.id)
    target_data.bannedFromUser.push(msg.author.id)
    target_data.probes.push(attach)
    target_data.reasons.push(reason)
    const id = generate()
    const bansdata = {
      id: target.id,
      timestamp: Date.now(),
      guildId: msg.guild.id,
      executedUserId: msg.author.id,
      lostReps: 1,
    }
    bans[id] = bansdata
    target_data.rep = target_data.rep + 1
    await Promise.all(msg.client.guilds.map(async guild => {
      const { banRep } = await data.server(guild.id)
      if (banRep !== 0 && banRep <= target_data.rep) return await guild.ban(target)
      return Promise.resolve()
    }))
    logger.log(`Banned user: ${target.tag} (${target.id}) from ${msg.guild.name}(${msg.guild.id})`)
    return msg.channel.send(':white_check_mark: ' + msg.language.get('COMMAND_BAN_BANNED'))
  }
}
