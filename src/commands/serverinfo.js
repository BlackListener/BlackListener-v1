const { Command, Discord } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('serverinfo')
  }

  run(msg, settings, lang) {
    const client = msg.client
    const prefix = settings.prefix ? `\`${settings.prefix}\`` : lang.sunknown
    const language = settings.language ? `\`${settings.language}\`` : lang.sunknown
    const notifyRep = settings.notifyRep || lang.unknownorzero
    const banRep = settings.banRep || lang.unknownorzero
    const antispam = settings.antispam ? lang.enabled : lang.disabled
    const banned = settings.banned ? lang.yes : lang.no
    const disable_purge = settings.disable_purge ? lang.no : lang.yes
    const autorole = settings.autorole ? `${lang.enabled} (${msg.guild.roles.get(settings.autorole).name}) [${settings.autorole}]` : lang.disabled
    const excludeLogging = settings.excludeLogging ? `${lang.enabled} (${client.channels.get(settings.excludeLogging).name}) (\`${client.channels.get(settings.excludeLogging).id}\`)` : lang.disabled
    if (!client.channels.has(settings.welcome_channel)) settings.welcome_channel = null
    const welcome_channel = settings.welcome_channel ? `${lang.enabled} (${client.channels.get(settings.welcome_channel).name})` : lang.disabled
    const welcome_message = settings.welcome_message ? `${lang.enabled} (\`\`\`${settings.welcome_message}\`\`\`)` : lang.disabled
    const ignoredChannels = settings.ignoredChannels.map((data) => {
      if (msg.guild.channels.has(data)) {
        return `<#${data}> (${msg.guild.channels.get(data).name}) (${data})`
      } else {
        return `<#${data}> ${data} (${lang.failed_to_get})`
      }
    })
    const mutes = settings.mute.map((data) => {
      if (client.users.has(data)) {
        return `<@${data}> (${client.users.get(data).tag})`
      } else {
        return `<@${data}> ${data} (${lang.failed_to_get})`
      }
    })
    const embed = new Discord.RichEmbed()
      .setTitle(' - Server Information - ')
      .setColor([0,255,0])
      .setTimestamp()
      .addField(lang.serverinfo.prefix, prefix)
      .addField(lang.serverinfo.language, language)
      .addField(lang.serverinfo.notifyRep, notifyRep, true)
      .addField(lang.serverinfo.banRep, banRep, true)
      .addField(lang.serverinfo.antispam, antispam)
      .addField(lang.serverinfo.ignoredChannels, ignoredChannels.join('\n') || lang.no)
      .addField(lang.serverinfo.banned, banned, true)
      .addField(lang.serverinfo.disable_purge, disable_purge, true)
      .addField(lang.serverinfo.autorole, autorole)
      .addField(lang.serverinfo.excludeLogging, excludeLogging)
      .addField(lang.serverinfo.mute, mutes.join('\n') || lang.no)
      .addField(lang.serverinfo.welcome_channel, welcome_channel, true)
      .addField(lang.serverinfo.welcome_message, welcome_message, true)
    return msg.channel.send(embed)
  }
}
