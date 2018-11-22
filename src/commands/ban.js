const Converter = require(__dirname + '/../converter.js')
const data = require(__dirname + '/../data')
const logger = require(__dirname + '/../logger').getLogger('commands:ban', 'blue')
const Discord = require('discord.js')
const { Command } = require('../core')
const config = require(__dirname + '/../config.yml')
const intformat = require('biguint-format')
const FlakeId = require('flake-idgen')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[<User> <Reason> <Probe>]',
      ],
      permission: 8,
    }
    super('ban', opts)
  }

  async run(msg, settings, lang, args) {
    const client = msg.client
    const bans = await data.bans()
    const flakeIdGen = new FlakeId({ epoch: 1514764800000 }) // 2018/1/1 0:00:00
    const generate = () => intformat(flakeIdGen.next(), 'dec')
    if (!args[1] || args[1] === '') {
      const bansList = await Promise.all(bans.map(async (id) => {
        const user = await client.fetchUser(id, false).catch(() => lang._failed_to_get)
        return `${user.tag} (${id})`
      }))
      const embed = new Discord.RichEmbed()
        .setTitle(lang.COMMAND_BAN_BANNED_USERS)
        .setColor([0,255,0])
        .setDescription(bansList.join('\n') || lang.COMMAND_BAN_NOT_BANNED)
      msg.channel.send(embed)
    } else {
      const target = Converter.toUser(msg, args[1])
      if (!target || !args[2] || !msg.attachments.first()) return msg.channel.send(lang._invalid_args)
      const target_data = await data.user(target.id)
      if (target_data.bannedFromServerOwner.includes(msg.guild.ownerID) && target_data.bannedFromServer.includes(msg.guild.id) && target_data.bannedFromUser.includes(msg.author.id))
        return msg.channel.send(lang.COMMAND_BAN_ALREADY_BANNED)
      const attach = msg.attachments.first().url
      if (client.user.id === target.id) return msg.channel.send(lang.COMMAND_BAN_CANNOT_BAN_MYSELF)
      if (target.id === msg.author.id) return msg.channel.send(lang.COMMAND_BAN_CANNOT_BAN_YOURSELF)
      if (config.owners.includes(target.id)) return msg.channel.send(lang.COMMAND_BAN_CANNOT_BAN_BOT_OWNERS)
      const member = msg.guild.member(target)
      if (!member && member.bannable) return msg.channel.send(lang.COMMAND_BAN_CANNOT_BAN)
      target_data.bannedFromServerOwner.push(msg.guild.ownerID)
      target_data.bannedFromServer.push(msg.guild.id)
      target_data.bannedFromUser.push(msg.author.id)
      target_data.probes.push(attach)
      target_data.reasons.push(args[2])
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
      logger.info(`Banned user: ${target.tag} (${target.id}) from ${msg.guild.name}(${msg.guild.id})`)
      return msg.channel.send(':white_check_mark: ' + lang.COMMAND_BAN_BANNED)
    }
  }
}
