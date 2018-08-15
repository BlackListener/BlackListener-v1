const Discord = require('discord.js')
const util = require('../util')
const f = require('string-format')

module.exports = async function(settings, msg, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const command = `${settings.prefix}antispam`
  const write = async function(value) {
    const localSettings = settings
    localSettings.antispam = value
    await util.writeSettings(guildSettings, localSettings, null, null, false)
  }
  if (!args[1] || args[1] === 'help') {
    let status
    if (settings.antispam) {
      status = lang.enabled
    } else {
      status = lang.disabled
    }
    const embed = new Discord.RichEmbed()
      .setTitle(' - AntiSpam - ')
      .setDescription(f(lang.antispam.description, status))
      .addField(`${command} toggle`, lang.antispam.toggle)
      .addField(`${command} disable`, lang.antispam.disable)
      .addField(`${command} enable`, lang.antispam.enable)
      .addField(`${command} ignore <#Channel>`, lang.antispam.ignore)
      .addField(`${command} status <#Channel>`, lang.antispam.status)
      .setTimestamp()
    msg.channel.send(embed)
  } else if (args[1] === 'toggle') {
    if (settings.antispam) {
      await write(false)
      msg.channel.send(lang.antispam.disabled)
    } else {
      await write(true)
      msg.channel.send(lang.antispam.enabled)
    }
  } else if (args[1] === 'disable') {
    await write(false)
    msg.channel.send(lang.antispam.disabled)
  } else if (args[1] === 'enable') {
    await write(true)
    msg.channel.send(lang.antispam.enabled)
  } else if (args[1] === 'ignore') {
    if (!msg.mentions.channels.first()) { return msg.channel.send(lang.invalid_args) }
    if (/\s/.test(args[2]) || !args[2]) { return msg.channel.send(lang.cannotspace) }
    const localSettings = settings
    let user2 = msg.mentions.channels.first()
    if (!user2) user2 = msg.guild.channels.find('name', args[2])
    if (!user2) user2 = msg.guild.channels.get(args[2])
    const id = user2 ? user2.id : ':poop:'
    if (id === ':poop:') return msg.channel.send(lang.invalid_args)
    if (localSettings.ignoredChannels.includes(id)) {
      delete localSettings.ignoredChannels[localSettings.ignoredChannels.indexOf(id)]
      await util.writeSettings(guildSettings, localSettings, null, null, false)
      msg.channel.send(lang.antispam.ignore_enabled)
    } else {
      localSettings.ignoredChannels.push(id)
      await util.writeSettings(guildSettings, localSettings, null, null, false)
      msg.channel.send(lang.antispam.ignore_disabled)
    }
  } else if (args[1] === 'status') {
    if (!msg.mentions.channels.first()) {
      const sb = []
      settings.ignoredChannels.forEach((channel) => {
        if (channel != null) {
          sb.push(`<#${channel}>`)
        }
      })
      return msg.channel.send(f(lang.antispam.disabled_channels, sb.join('\n')))
    }
    const id = msg.mentions.channels.first().id
    if (/\s/.test(args[2]) || !args[2]) { return msg.channel.send(lang.cannotspace) }
    if (settings.ignoredChannels.includes(id)) return msg.channel.send(f(lang.antispam.status2, lang.disabled))
    msg.channel.send(f(lang.antispam.status2, lang.enabled))
  }
}
