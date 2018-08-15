const util = require('../util')
const logger = require('../logger').getLogger('commands:unban', 'blue')

module.exports = async function(settings, msg, lang, user, bans) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  const userFile = `./data/users/${msg.author.id}/config.json`
  const bansFile = './data/bans.json'
  if (!args[1] || args[1] === '') {
    msg.channel.send(lang.no_args)
  } else {
    if (msg.guild && msg.guild.available && !msg.author.bot) {
      let user2
      if (/[0-9]................./.test(args[1])) {
        user2 = client.users.get(args[1])
      } else {
        user2 = client.users.find('username', args[1])
      }
      if (msg.mentions.users.first()) user2 = msg.mentions.users.first()
      if (!user2) { settings = null; return msg.channel.send(lang.invalid_user) }
      const ban = bans
      let exe = false
      for (let i=0; i<=bans.length; i++) {
        if (bans[i] == user2.id) {
          exe = true
          delete ban[i]
        }
      }
      if (!exe) { settings = null; return msg.channel.send(lang.notfound_user) }
      for (let i=0; i<=client.guilds.length; i++) {
        client.guilds[i].unban(user2)
          .then(user2 => logger.info(`Unbanned user(${i}): ${user2.tag} (${user2.id}) from ${client.guilds[i].name}(${client.guilds[i].id})`))
          .catch(logger.error)
      }
      user.rep = --user.rep
      await util.writeSettings(bansFile, ban, null, null, false)
      await util.writeSettings(userFile, user, null, null, false)
      msg.channel.send(lang.unbanned)
    } else {
      msg.channel.send(lang.guild_unavailable)
    }
  }
}
