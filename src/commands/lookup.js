const f = require('string-format')
const Discord = require('discord.js')
const logger = require('../logger').getLogger('commands:lookup', 'purple')
const data = require('../data')

module.exports.args = ['<User>']

module.exports.name = 'lookup'

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  let id; let force = false
  if (msg.mentions.users.first()) {
    id = msg.mentions.users.first().id
  } else {
    if (args[2] === '--force') { force = true; id = lang.sunknown }
    if (!force) {
      if (/\D/gm.test(args[1])) {
        try {
          id = client.users.find(n => n.username === args[1]).id || msg.guild.members.find(n => n.nickname === args[1]).id
        } catch (e) {
          logger.warn(e)
          return msg.channel.send(f(lang.unknown, args[1]))
        }
      } else if (/\d{18}/.test(args[1])) {
        try {
          id = client.users.get(args[1]).id || client.users.find(n => n.username === args[1]).id || msg.guild.members.find(n => n.nickname === args[1]).id
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
  }
  let userConfig
  let user2
  try {
    if (!force) {
      userConfig = await data.user(id)
      user2 = client.users.get(id)
    }
  } catch (e) {
    logger.error(e)
    return msg.channel.send(f(lang.unknown, args[1]))
  }
  const bannedFromServer = userConfig ? userConfig.bannedFromServer.map((server, i) => `${server} (${userConfig.bannedFromServerOwner[i]})`) : [lang.sunknown]
  const usernameChanges = userConfig ? userConfig.username_changes.filter(e => e) : [lang.sunknown]
  let isBot = lang.no
  if (!force) { if (user2.bot) isBot = lang.yes } else { isBot = lang.sunknown }
  const desc = force ? `${lang.lookup.desc} ・ ${f(lang.unknown, args[1])}` : lang.lookup.desc
  const nick = user2 ? msg.guild.members.get(user2.id).nickname : lang.nul
  const joinedAt = user2 ? msg.guild.members.get(user2.id).joinedAt.toLocaleString() : lang.sunknown
  const embed = new Discord.RichEmbed()
    .setTitle(lang.lookup.title)
    .setColor([0,255,0])
    .setFooter(desc)
    .setThumbnail(user2.avatarURL)
    .addField(lang.lookup.rep, userConfig.rep)
    .addField(lang.lookup.bannedFromServer, bannedFromServer.join('\n') || lang.lookup.not_banned)
    .addField(lang.lookup.bannedFromUser, userConfig ? userConfig.bannedFromUser.join('\n') : lang.lookup.not_banned)
    .addField(lang.lookup.probes, userConfig ? userConfig.probes.join('\n') : lang.lookup.not_banned)
    .addField(lang.lookup.reasons, userConfig ? userConfig.reasons.join('\n') : lang.lookup.not_banned)
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
