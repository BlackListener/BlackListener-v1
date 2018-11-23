const Discord = require('discord.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor() {
    super('serverinfo')
  }

  run(msg, settings, lang) {
    const client = msg.client
    const prefix = settings.prefix ? `\`${settings.prefix}\`` : lang._sunknown
    const language = settings.language ? `\`${settings.language}\`` : lang._sunknown
    const notifyRep = settings.notifyRep || lang.COMMAND_SERVERINFO_UNKNOWNORZERO
    const banRep = settings.banRep || lang.COMMAND_SERVERINFO_UNKNOWNORZERO
    const banned = settings.banned ? lang._yes : lang._no
    const disable_purge = settings.disable_purge ? lang._no : lang._yes
    const autorole = settings.autorole ? `${lang.COMMAND_SERVERINFO_ENABLED} (${msg.guild.roles.get(settings.autorole).name}) [${settings.autorole}]` : lang.COMMAND_SERVERINFO_DISABLED
    const excludeLogging = settings.excludeLogging ? `${lang.COMMAND_SERVERINFO_ENABLED} (${client.channels.get(settings.excludeLogging).name}) (\`${client.channels.get(settings.excludeLogging).id}\`)` : lang.COMMAND_SERVERINFO_DISABLED
    if (!client.channels.has(settings.welcome_channel)) settings.welcome_channel = null
    const welcome_channel = settings.welcome_channel ? `${lang.COMMAND_SERVERINFO_ENABLED} (${client.channels.get(settings.welcome_channel).name})` : lang.COMMAND_SERVERINFO_DISABLED
    const welcome_message = settings.welcome_message ? `${lang.COMMAND_SERVERINFO_ENABLED} (\`\`\`${settings.welcome_message}\`\`\`)` : lang.COMMAND_SERVERINFO_DISABLED
    const mutes = settings.mute.map((data) => {
      if (client.users.has(data)) {
        return `<@${data}> (${client.users.get(data).tag})`
      } else {
        return `<@${data}> ${data} (${lang._failed_to_get})`
      }
    })
    const embed = new Discord.MessageEmbed()
      .setTitle(' - Server Information - ')
      .setColor([0,255,0])
      .setTimestamp()
      .addField(lang.COMMAND_SERVERINFO_PREFIX, prefix)
      .addField(lang.COMMAND_SERVERINFO_LANGUAGE, language)
      .addField(lang.COMMAND_SERVERINFO_NOTIFYREP, notifyRep, true)
      .addField(lang.COMMAND_SERVERINFO_BANREP, banRep, true)
      .addField(lang.COMMAND_SERVERINFO_BANNED, banned, true)
      .addField(lang.COMMAND_SERVERINFO_DISABLE_PURGE, disable_purge, true)
      .addField(lang.COMMAND_SERVERINFO_AUTOROLE, autorole)
      .addField(lang.COMMAND_SERVERINFO_EXCLUDELOGGING, excludeLogging)
      .addField(lang.COMMAND_SERVERINFO_MUTE, mutes.join('\n') || lang._no)
      .addField(lang.COMMAND_SERVERINFO_WELCOME_CHANNEL, welcome_channel, true)
      .addField(lang.COMMAND_SERVERINFO_WELCOME_MESSAGE, welcome_message, true)
    return msg.channel.send(embed)
  }
}
