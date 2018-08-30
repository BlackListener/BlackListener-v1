const Discord = require('discord.js')

module.exports = function(msg, settings, lang) {
  const client = msg.client
  let prefix = lang.sunknown
  let language = lang.sunknown
  let notifyRep = lang.unknownorzero
  let banRep = lang.unknownorzero
  let antispam = lang.disabled
  let banned = lang.no
  let disable_purge = lang.yes
  let ignoredChannels = lang.no
  let autorole = lang.disabled
  let excludeLogging = lang.disabled
  let welcome_channel = lang.disabled
  let welcome_message = lang.disabled
  const muteSB = [lang.no]
  const ignoredChannelsSB = [lang.no]
  const blocked_roleSB  = [lang.no]
  if (settings.prefix) prefix = `\`${settings.prefix}\``
  if (settings.language) language = `\`${settings.language}\``
  if (settings.notifyRep) notifyRep = settings.notifyRep
  if (settings.banRep) banRep = settings.banRep
  if (settings.antispam) antispam = lang.enabled
  if (settings.banned) banned = lang.yes
  if (settings.disable_purge) disable_purge = lang.no
  if (settings.autorole) autorole = `${lang.enabled} (${msg.guild.roles.get(settings.autorole).name}) [${settings.autorole}]`
  if (settings.excludeLogging) excludeLogging = `${lang.enabled} (${client.channels.get(settings.excludeLogging).name}) (\`${client.channels.get(settings.excludeLogging).id}\`)`
  if (settings.welcome_channel) welcome_channel = `${lang.enabled} (${client.channels.get(settings.welcome_channel).name})`
  if (settings.welcome_message) welcome_message = `${lang.enabled} (\`\`\`${settings.welcome_message}\`\`\`)`
  if (settings.ignoredChannels.length != 0) {
    ignoredChannelsSB.length = 0
    settings.ignoredChannels.forEach((data) => {
      if (data) {
        if (msg.guild.channels.get(data)) {
          ignoredChannelsSB.push(`<#${data}> (${msg.guild.channels.get(data).name}) (${data})`)
        } else {
          ignoredChannelsSB.push(`<#${data}> ${data} (${lang.failed_to_get})`)
        }
      }
    })
    ignoredChannels = ignoredChannelsSB.join('\n')
  }
  if (settings.mute.length != 0) {
    muteSB.length = 0
    settings.mute.forEach((data) => {
      if (data) {
        if (client.users.has(data)) {
          muteSB.push(`<@${data}> (${client.users.get(data).tag})`)
        } else {
          muteSB.push(`<@${data}> ${data} (${lang.failed_to_get})`)
        }
      }
    })
  }
  if (settings.blocked_role.length != 0) {
    muteSB.length = 0
    settings.blocked_role.forEach((data) => {
      if (data) {
        if (msg.guild.roles.has(data)) {
          blocked_roleSB.push(`${msg.guild.roles.get(data).name} (${data})`)
        } else {
          blocked_roleSB.push(`${data} (${lang.failed_to_get})`)
        }
      }
    })
  }
  const embed = new Discord.RichEmbed()
    .setTitle(' - Server Information - ')
    .setColor([0,255,0])
    .setTimestamp()
    .addField(lang.serverinfo.prefix, prefix)
    .addField(lang.serverinfo.language, language)
    .addField(lang.serverinfo.notifyRep, notifyRep)
    .addField(lang.serverinfo.banRep, banRep)
    .addField(lang.serverinfo.antispam, antispam)
    .addField(lang.serverinfo.ignoredChannels, ignoredChannels)
    .addField(lang.serverinfo.banned, banned)
    .addField(lang.serverinfo.disable_purge, disable_purge)
    .addField(lang.serverinfo.autorole, autorole)
    .addField(lang.serverinfo.excludeLogging, excludeLogging)
    .addField(lang.serverinfo.mute, muteSB.join('\n'))
    .addField(lang.serverinfo.welcome_channel, welcome_channel)
    .addField(lang.serverinfo.welcome_message, welcome_message)
    .addField(lang.serverinfo.blocked_role, blocked_roleSB.join('\n'))
  return msg.channel.send(embed)
}
