const Discord = require('discord.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      permissionLevel: 6,
    })
  }

  run(msg) {
    const mutes = settings.mute.map((data) => {
      if (msg.client.users.has(data)) {
        return `<@${data}> (${msg.client.users.get(data).tag})`
      } else {
        return `<@${data}> ${data} (${msg.language.get('_failed_to_get')})`
      }
    })
    return msg.channel.send(new Discord.MessageEmbed()
      .setTitle(msg.language.get('COMMAND_MUTE_MUTED'))
      .setDescription(mutes.join('\n') || msg.language.get('_no'))
    )
  }
}
