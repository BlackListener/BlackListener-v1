const data = require(__dirname + '/../data')
const logger = require(__dirname + '/../logger').getLogger('commands:ban', 'blue')
const Discord = require('discord.js')
const { Command } = require('../core')

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

  async run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    const client = msg.client
    const bans = await data.bans()
    if (!args[1] || args[1] === '') {
      const bansList = await Promise.all(bans.map(async (id) => {
        if (id) {
          const user = await client.fetchUser(id).catch(() => { }) || lang.failed_to_get
          return `${user.tag} (${id})`
        }
      }))
      const embed = new Discord.RichEmbed()
        .setTitle(lang.banned_users)
        .setColor([0,255,0])
        .setDescription(bansList.join('\n') || lang.not_banned)
      msg.channel.send(embed)
    } else {
      if (msg.guild && msg.guild.available && !msg.author.bot) {
        if (!args[2]) return msg.channel.send(lang.invalid_args)
        let user2
        let fetchedBans
        let attach
        const reason = args[2]
        const user = await data.user(msg.author.id)
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
        if (!msg.guild.members.has(userid)) return msg.channel.send(lang.banned)
        msg.guild.ban(userid, { 'reason': reason })
          .then(user2 => logger.info(`Banned user: ${user2.tag} (${user2.id}) from ${msg.guild.name}(${msg.guild.id})`))
          .catch(e => logger.error(e))
        return msg.channel.send(':white_check_mark: ' + lang.banned)
      }
    }
  }
}
