const data = require(__dirname + '/../data')
const logger = require(__dirname + '/../logger').getLogger('commands:unban', 'blue')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<User>',
      ],
    }
    super('unban', opts)
  }

  isAllowed(msg) {
    return msg.member.hasPermission(8)
  }

  async run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    const client = msg.client
    const user = await data.user(msg.author.id)
    const bans = await data.bans()
    if (!args[1] || args[1] === '') {
      msg.channel.send(lang.no_args)
    } else {
      if (msg.guild && msg.guild.available && !msg.author.bot) {
        let user2
        if (/[0-9]................./.test(args[1])) {
          user2 = client.users.get(args[1])
        } else {
          user2 = client.users.find(n => n.username === args[1])
        }
        if (msg.mentions.users.first()) user2 = msg.mentions.users.first()
        if (!user2) return msg.channel.send(lang.invalid_user)
        const exe = bans.includes(user2.id)
        bans.splice(bans.indexOf(user2.id), 1)
        if (!exe) return msg.channel.send(lang.notfound_user)
        for (const guild of client.guilds) {
          guild.unban(user2)
            .then(user2 => logger.info(`Unbanned user: ${user2.tag} (${user2.id}) from ${guild.name}(${guild.id})`))
            .catch(e => logger.error(e))
        }
        user.rep = --user.rep
        msg.channel.send(lang.unbanned)
      } else {
        msg.channel.send(lang.guild_unavailable)
      }
    }
  }
}
