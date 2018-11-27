const Discord = require('discord.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'serverinfo',
    })
  }

  run(msg) {
    const client = msg.client
    const prefix = settings.prefix ? `\`${settings.prefix}\`` : msg.language.get('_sunknown')
    const language = settings.language ? `\`${settings.language}\`` : msg.language.get('_sunknown')
    const notifyRep = settings.notifyRep || msg.language.get('COMMAND_SERVERINFO_UNKNOWNORZERO')
    const banRep = settings.banRep || msg.language.get('COMMAND_SERVERINFO_UNKNOWNORZERO')
    const banned = settings.banned ? msg.language.get('_yes') : msg.language.get('_no')
    const disable_purge = settings.disable_purge ? msg.language.get('_no') : msg.language.get('_yes')
    const autorole = settings.autorole ? `${msg.language.get('COMMAND_SERVERINFO_ENABLED')} (${msg.guild.roles.get(settings.autorole).name}) [${settings.autorole}]` : msg.language.get('COMMAND_SERVERINFO_DISABLED')
    const excludeLogging = settings.excludeLogging ? `${msg.language.get('COMMAND_SERVERINFO_ENABLED')} (${client.channels.get(settings.excludeLogging).name}) (\`${client.channels.get(settings.excludeLogging).id}\`)` : msg.language.get('COMMAND_SERVERINFO_DISABLED')
    if (!client.channels.has(settings.welcome_channel)) settings.welcome_channel = null
    const welcome_channel = settings.welcome_channel ? `${msg.language.get('COMMAND_SERVERINFO_ENABLED')} (${client.channels.get(settings.welcome_channel).name})` : msg.language.get('COMMAND_SERVERINFO_DISABLED')
    const welcome_message = settings.welcome_message ? `${msg.language.get('COMMAND_SERVERINFO_ENABLED')} (\`\`\`${settings.welcome_message}\`\`\`)` : msg.language.get('COMMAND_SERVERINFO_DISABLED')
    const mutes = settings.mute.map((data) => {
      if (client.users.has(data)) {
        return `<@${data}> (${client.users.get(data).tag})`
      } else {
        return `<@${data}> ${data} (${msg.language.get('_failed_to_get')})`
      }
    })
    const embed = new Discord.MessageEmbed()
      .setTitle(' - Server Information - ')
      .setColor([0,255,0])
      .setTimestamp()
      .addField(msg.language.get('COMMAND_SERVERINFO_PREFIX'), prefix)
      .addField(msg.language.get('COMMAND_SERVERINFO_LANGUAGE'), language)
      .addField(msg.language.get('COMMAND_SERVERINFO_NOTIFYREP'), notifyRep, true)
      .addField(msg.language.get('COMMAND_SERVERINFO_BANREP'), banRep, true)
      .addField(msg.language.get('COMMAND_SERVERINFO_BANNED'), banned, true)
      .addField(msg.language.get('COMMAND_SERVERINFO_DISABLE_PURGE'), disable_purge, true)
      .addField(msg.language.get('COMMAND_SERVERINFO_AUTOROLE'), autorole)
      .addField(msg.language.get('COMMAND_SERVERINFO_EXCLUDELOGGING'), excludeLogging)
      .addField(msg.language.get('COMMAND_SERVERINFO_MUTE'), mutes.join('\n') || msg.language.get('_no'))
      .addField(msg.language.get('COMMAND_SERVERINFO_WELCOME_CHANNEL'), welcome_channel, true)
      .addField(msg.language.get('COMMAND_SERVERINFO_WELCOME_MESSAGE'), welcome_message, true)
    return msg.channel.send(embed)
  }
}
