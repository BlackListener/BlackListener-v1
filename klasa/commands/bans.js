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
    const data = client.providers.get('json')
    const bans = await data.getAll('bans')
    const bansList = await Promise.all(bans.map(async data => {
      const user = await msg.client.users.fetch(data.id, false).catch(() => msg.language.get('_failed_to_get'))
      return `${user.tag} (${data.id})`
    }))
    const embed = new Discord.MessageEmbed()
      .setTitle(msg.language.get('COMMAND_BAN_BANNED_USERS'))
      .setColor([0,255,0])
      .setDescription(bansList.join('\n') || msg.language.get('COMMAND_BAN_NOT_BANNED'))
    msg.channel.send(embed)
  }
}
