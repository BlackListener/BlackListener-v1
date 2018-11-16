const Converter = require(__dirname + '/../converter.js')
const Discord = require('discord.js')
const data = require(__dirname + '/../data')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<User>',
      ],
    }
    super('lookup', opts)
  }

  async run(msg, settings, lang) {
    const arg = msg.content.replace(settings.prefix+'lookup ', '')
    if (!arg) return msg.channel.send(lang.no_args)
    const client = msg.client
    let user = Converter.toUser(msg, arg)
    if (!user) user = await client.fetchUser(arg, false).catch(() => null)
    if (!user) return msg.channel.send(lang.invalid_args)
    const userConfig = await data.user(user.id)
    userConfig.tag = user.tag
    userConfig.createdTimestamp = user.createdTimestamp
    userConfig.bot = user.bot
    const bannedFromServer = userConfig && userConfig.bannedFromServer ? userConfig.bannedFromServer.map((server, i) => `${server} (${userConfig.bannedFromServerOwner[i]})`) : [lang.sunknown]
    const usernameChanges = userConfig && userConfig.username_changes ? userConfig.username_changes.filter(e => e) : [lang.sunknown]
    const isBot = userConfig.bot ? lang.yes : lang.no
    const nick = (user && msg.guild.members.has(user.id)) ? msg.guild.members.get(user.id).nickname : lang.nul
    const joinedAt = user && msg.guild.members.has(user.id) && msg.guild.members.has(user.id).joinedAt ? msg.guild.members.get(user.id).joinedAt.toLocaleString() : lang.sunknown
    const embed = new Discord.RichEmbed()
      .setTitle(lang.lookup.title)
      .setColor([0,255,0])
      .setThumbnail(user.avatarURL)
      .addField(lang.lookup.rep, userConfig.rep)
      .addField(lang.lookup.bannedFromServer, bannedFromServer.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.bannedFromUser, userConfig.bannedFromUser.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.probes, userConfig.probes.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.reasons, userConfig.reasons.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.tag, user.tag)
      .addField(lang.lookup.nickname, nick)
      .addField(lang.lookup.id, user.id)
      .addField(lang.lookup.username_changes, usernameChanges.join('\n') || lang.no)
      .addField(lang.lookup.bot, isBot)
      .addField(lang.lookup.createdAt, user && user.createdAt ? user.createdAt.toLocaleString() : lang.sunknown)
      .addField(lang.lookup.joinedAt, joinedAt)
      .addField(lang.lookup.nowTime, new Date().toLocaleString())
    msg.channel.send(embed)
  }
}
