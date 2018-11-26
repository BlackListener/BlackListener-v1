const data = require(__dirname + '/../data')
const Discord = require('discord.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      permissionLevel: 6,
    })
  }

  async run(msg) {
    const client = msg.client
    const bans = await data.bans()
    const bansList = await Promise.all(bans.map(async (id) => {
      const user = await client.fetchUser(id, false).catch(() => lang._failed_to_get)
      return `${user.tag} (${id})`
    }))
    const embed = new Discord.MessageEmbed()
      .setTitle(lang.COMMAND_BAN_BANNED_USERS)
      .setColor([0,255,0])
      .setDescription(bansList.join('\n') || lang.COMMAND_BAN_NOT_BANNED)
    msg.channel.send(embed)
  }
}
