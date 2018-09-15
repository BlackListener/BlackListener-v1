const util = require('../util')
const bansFile = './data/bans.json'
const { defaultUser, defaultBans } = require('../contents.js')
const fs = require('fs').promises
const logger = require('../logger').getLogger('commands:ban', 'blue')

module.exports.args = ['[<ID/Mentions/Name> <Reason> <Probe>]']

module.exports.name = 'ban'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  if (args[1] || args[1] !== '') {
    if (msg.guild && msg.guild.available && !msg.author.bot) {
      !(async () => {
        if (!args[2]) return msg.channel.send(lang.invalid_args)
        let user2
        let fetchedBans
        let attach
        const bans = await util.readJSON(bansFile, defaultBans)
        const reason = args[2]
        const userFile = `./data/users/${msg.author.id}/config.json`
        const user = Object.assign(defaultUser, await util.readJSON(userFile, defaultUser))
        if (args[3] !== '--force') { if (user.bannedFromServerOwner.includes(msg.guild.ownerID) && user.bannedFromServer.includes(msg.guild.id) && user.bannedFromUser.includes(msg.author.id)) return msg.channel.send(lang.already_banned) }
        if (msg.mentions.users.first()) {
          user2 = msg.mentions.users.first()
        } else if (/\d{18}/.test(args[1])) {
          args[1] = args[1].replace('<@', '').replace('>', '')
          fetchedBans = await msg.guild.fetchBans()
          if (fetchedBans.has(args[1])) {
            user2 = fetchedBans.get(args[1])
          } else {
            user2 = client.users.get(args[1])
          }
        } else {
          user2 = client.users.find(n => n.username === args[1])
          if (!user2) user2 = client.users.get(args[1])
        }
        if (!msg.attachments.first()) {
          return msg.channel.send(lang.invalid_args)
        } else {
          attach = msg.attachments.first().url
        }
        if (msg.mentions.users.first()) { user2 = msg.mentions.users.first() }
        if (args[3] !== '--force') { if (!user2) { return msg.channel.send(lang.invalid_user) } }
        let userid
        if (args[3] === '--force') { userid = args[1] } else { userid = user2.id }
        user.bannedFromServerOwner.push(msg.guild.ownerID)
        user.bannedFromServer.push(msg.guild.id)
        user.bannedFromUser.push(msg.author.id)
        user.probes.push(attach)
        user.reasons.push(reason)
        bans.push(userid)
        user.rep = ++user.rep
        const targetUserFile = `./data/users/${userid}/config.json`
        await fs.writeFile(bansFile, JSON.stringify(bans, null, 4), 'utf8')
        await fs.writeFile(targetUserFile, JSON.stringify(user, null, 4), 'utf8')
        if (!msg.guild.members.has(userid)) return msg.channel.send(lang.banned)
        msg.guild.ban(userid, { 'reason': reason })
          .then(user2 => logger.info(`Banned user: ${user2.tag} (${user2.id}) from ${msg.guild.name}(${msg.guild.id})`))
          .catch(e => logger.error(e))
        return msg.channel.send(lang.banned)
      })()
    }
  } else {
    msg.channel.send(':x: ' + lang.not_specified_user)
  }
}
