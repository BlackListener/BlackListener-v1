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
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (!args[1]) return msg.channel.send(lang.no_args)
    const client = msg.client
    let id
    if (msg.mentions.users.first()) {
      id = msg.mentions.users.first().id
    } else {
      if (/\D/gm.test(args[1])) {
        try {
          id = client.users.find(n => n.username === args[1]).id || msg.guild.members.find(n => n.nickname === args[1]).id
        } catch (e) {
          logger.warn(e)
          return msg.channel.send(f(lang.unknown, args[1]))
        }
      } else if (/\d{17,19}/.test(args[1])) {
        try {
          id = (await client.fetchUser(args[1], false)).id || client.users.find(n => n.username === args[1]).id || msg.guild.members.find(n => n.nickname === args[1]).id
        } catch (e) {
          msg.channel.send(f(lang.unknown, args[1]))
          return logger.warn(e)
        }
      } else {
        try {
          id = client.users.find(n => n.username === args[1]).id || msg.guild.members.find(n => n.nickname === args[1]).id
        } catch (e) {
          logger.warn(e)
          return msg.channel.send(f(lang.unknown, args[1]))
        }
      }
    }
    let userConfig = {}
    let user2
    try {
      try {
        userConfig = await data.user(id)
      } catch(e){/* ignore */}
      user2 = await client.fetchUser(args[1], false)
    } catch (e) {
      logger.error(e)
      return msg.channel.send(f(lang.unknown, args[1]))
    }
    const bannedFromServer = userConfig ? userConfig.bannedFromServer.map((server, i) => `${server} (${userConfig.bannedFromServerOwner[i]})`) : [lang.sunknown]
    const usernameChanges = userConfig ? userConfig.username_changes.filter(e => e) : [lang.sunknown]
    let isBot = lang.no
    if (user2.bot) isBot = lang.yes
    const nick = (user2 && msg.guild.members.get(user2.id)) ? msg.guild.members.get(user2.id).nickname : lang.nul
    const joinedAt = user2 && msg.guild.members.get(user2.id) ? msg.guild.members.get(user2.id).joinedAt.toLocaleString() : lang.sunknown
    const embed = new Discord.RichEmbed()
      .setTitle(lang.lookup.title)
      .setColor([0,255,0])
      .setThumbnail(user2.avatarURL)
      .addField(lang.lookup.rep, userConfig.rep)
      .addField(lang.lookup.bannedFromServer, bannedFromServer.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.bannedFromUser, userConfig.bannedFromUser.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.probes, userConfig.probes.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.reasons, userConfig.reasons.join('\n') || lang.lookup.not_banned)
      .addField(lang.lookup.tag, user2.tag)
      .addField(lang.lookup.nickname, nick)
      .addField(lang.lookup.id, user2.id)
      .addField(lang.lookup.username_changes, usernameChanges.join('\n') || lang.no)
      .addField(lang.lookup.bot, isBot)
      .addField(lang.lookup.createdAt, user2 ? user2.createdAt.toLocaleString() : lang.sunknown)
      .addField(lang.lookup.joinedAt, joinedAt)
      .addField(lang.lookup.nowTime, new Date().toLocaleString())
    msg.channel.send(embed)
  }
}
