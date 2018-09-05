const f = require('string-format')
const Discord = require('discord.js')
const logger = require('../logger').getLogger('commands:lookup', 'purple')
const util = require('../util')

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
          id = client.users.find('username', args[1]).id || msg.guild.members.find('nickname', args[1]).id
        } catch (e) {
          logger.error(e)
          return msg.channel.send(f(lang.unknown, args[1]))
        }
      } else if (/\d{18}/.test(args[1])) {
        try {
          id = client.users.get(args[1]).id || client.users.find('username', args[1]).id || msg.guild.members.find('nickname', args[1]).id
        } catch (e) {
          msg.channel.send(f(lang.unknown, args[1]))
          return logger.error(e)
        }
      } else {
        try {
          id = client.users.find('username', args[1]).id || msg.guild.members.find('nickname', args[1]).id
        } catch (e) {
          logger.error(e)
          return msg.channel.send(f(lang.unknown, args[1]))
        }
      }
    }
  }
  let userConfig
  let user2
  const sb = [lang.lookup.not_banned]
  const sb2 = [lang.lookup.not_banned]
  const sb3 = [lang.lookup.not_banned]
  const sb4 = [lang.lookup.not_banned]
  const sb6 = [lang.no]
  let isBot = lang.no
  try {
    userConfig = await util.readYAML(`./data/users/${id}/config.yml`)
    user2 = client.users.get(id)
  } catch (e) {
    logger.error(e)
    return msg.channel.send(f(lang.unknown, args[1]))
  }
  if (!force) { if (user2.bot) isBot = lang.yes } else { isBot = lang.sunknown }
  try {
    for (let i=0;i<=userConfig.probes.length;i++) {
      let once = false
      if (userConfig.bannedFromServer[i] != null) {
        if (!once) {
          sb.length = 0
          sb2.length = 0
          sb3.length = 0
          sb4.length = 0
          once = true
        }
        sb.push(`${userConfig.bannedFromServer[i]} (${userConfig.bannedFromServerOwner[i]})`)
      }
      if (userConfig.bannedFromUser[i] != null) sb2.push(userConfig.bannedFromUser[i])
      if (userConfig.probes[i] != null) sb3.push(userConfig.probes[i])
      if (userConfig.reasons[i] != null) sb4.push(userConfig.reasons[i])
    }
  } catch (e) {
    sb.length = 0
    sb2.length = 0
    sb3.length = 0
    sb4.length = 0
    sb.push(lang.sunknown)
    sb2.push(lang.sunknown)
    sb3.push(lang.sunknown)
    sb4.push(lang.sunknown)
  }
  try {
    let once = false
    if (!once) {
      sb6.length = 0
      once = true
    }
    sb6.push(...userConfig.username_changes.filter(e => e))
  } catch (e) {
    sb6.length = 0
    sb6.push(lang.sunknown)
    logger.error(`Error while lookup command (sb6) ${e}`)
  }
  if (!sb6.length) sb6.push(lang.no)
  const desc = force ? lang.lookup.desc + ' ・ ' + f(lang.unknown, args[1]) : lang.lookup.desc
  const nick = msg.guild.members.get(user2.id).nickname || lang.nul
  const joinedAt = msg.guild.members.get(user2.id).joinedAt.toLocaleString() || lang.sunknown
  const embed = new Discord.RichEmbed()
    .setTitle(lang.lookup.title)
    .setColor([0,255,0])
    .setFooter(desc)
    .setThumbnail(user2.avatarURL)
    .addField(lang.lookup.rep, userConfig.rep)
    .addField(lang.lookup.bannedFromServer, sb.join('\n'))
    .addField(lang.lookup.bannedFromUser, sb2.join('\n'))
    .addField(lang.lookup.probes, sb3.join('\n'))
    .addField(lang.lookup.reasons, sb4.join('\n'))
    .addField(lang.lookup.tag, user2.tag)
    .addField(lang.lookup.nickname, nick)
    .addField(lang.lookup.id, user2.id)
    .addField(lang.lookup.username_changes, sb6.join('\n'))
    .addField(lang.lookup.bot, isBot)
    .addField(lang.lookup.createdAt, user2.createdAt.toLocaleString())
    .addField(lang.lookup.joinedAt, joinedAt)
    .addField(lang.lookup.nowTime, new Date().toLocaleString())
  msg.channel.send(embed)
}
