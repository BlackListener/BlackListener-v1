const f = require('string-format')
const Discord = require('discord.js')
const logger = require(__dirname + '/../logger').getLogger('commands:lookup', 'purple')
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
    let user
    if (msg.mentions.users.first()) {
      user = msg.mentions.users.first()
    } else {
      if (/\D/gm.test(arg)) {
        try {
          user = client.users.find(n => n.username === arg) || msg.guild.members.find(n => n.nickname === arg).user || msg.client.users.find(n => n.tag === arg)
        } catch (e) {
          logger.warn(e)
          return msg.channel.send(f(lang.unknown, arg))
        }
      } else if (/\d{17,19}/.test(arg)) {
        try {
          user = await client.fetchUser(arg, false) || client.users.find(n => n.username === arg) || msg.guild.members.find(n => n.nickname === arg).user || msg.client.users.find(n => n.tag === arg)
        } catch (e) {
          logger.warn(e)
          return msg.channel.send(f(lang.unknown, arg))
        }
      } else {
        try {
          user = client.users.find(n => n.username === arg) || msg.guild.members.find(n => n.nickname === arg).user || msg.client.users.find(n => n.tag === arg)
        } catch (e) {
          logger.warn(e)
          return msg.channel.send(f(lang.unknown, arg))
        }
      }
    }
    let userConfig = {}
    try {
      userConfig = await data.user(user.id)
      try {
        if (!user) user = client.fetchUser(arg, false)
      } catch(e) {
        logger.warn(e)
        return msg.channel.send(f(lang.unknown, arg))
      }
    } catch(e){/* ignore */}
    const bannedFromServer = userConfig && userConfig.bannedFromServer ? userConfig.bannedFromServer.map((server, i) => `${server} (${userConfig.bannedFromServerOwner[i]})`) : [lang.sunknown]
    const usernameChanges = userConfig && userConfig.username_changes ? userConfig.username_changes.filter(e => e) : [lang.sunknown]
    let isBot = lang.no
    if (user.bot) isBot = lang.yes
    const nick = (user && msg.guild.members.get(user.id)) ? msg.guild.members.get(user.id).nickname : lang.nul
    const joinedAt = user && msg.guild.members.get(user.id) && msg.guild.members.get(user.id).joinedAt ? msg.guild.members.get(user.id).joinedAt.toLocaleString() : lang.sunknown
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
