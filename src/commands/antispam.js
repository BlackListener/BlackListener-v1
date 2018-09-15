const Discord = require('discord.js')
const f = require('string-format')

module.exports.args = [
  '',
  'toggle',
  'disable',
  'enable',
  'ignore <Channel>',
  'status [Channel]',
]

module.exports.name = 'antispam'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const command = `${settings.prefix}antispam`
  if (!args[1] || args[1] === 'help') {
    const status = settings.antispam ? lang.enabled : lang.disabled
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
    settings.antispam = !settings.antispam
    msg.channel.send(lang.antispam[!settings.antispam ? 'disabled' : 'enabled'])
  } else if (args[1] === 'disable') {
    settings.antispam = false
    msg.channel.send(lang.antispam.disabled)
  } else if (args[1] === 'enable') {
    settings.antispam = true
    msg.channel.send(lang.antispam.enabled)
  } else if (args[1] === 'ignore') {
    if (!msg.mentions.channels.first()) { return msg.channel.send(lang.invalid_args) }
    if (/\s/.test(args[2]) || !args[2]) { return msg.channel.send(lang.cannotspace) }
    let user2 = msg.mentions.channels.first()
    if (!user2) user2 = msg.guild.channels.find(n => n.name === args[2])
    if (!user2) user2 = msg.guild.channels.get(args[2])
    const id = user2 ? user2.id : ':poop:'
    if (id === ':poop:') return msg.channel.send(lang.invalid_args)
    if (settings.ignoredChannels.includes(id)) {
      settings.ignoredChannels.splice(settings.ignoredChannels.indexOf(id), 1)
      msg.channel.send(lang.antispam.ignore_enabled)
    } else {
      settings.ignoredChannels.push(id)
      msg.channel.send(lang.antispam.ignore_disabled)
    }
  } else if (args[1] === 'status') {
    if (!msg.mentions.channels.first()) {
      const channels = settings.ignoredChannels.map((channel) => `<#${channel}>`)
      return msg.channel.send(f(lang.antispam.disabled_channels, channels.join('\n')))
    }
    const id = msg.mentions.channels.first().id
    if (/\s/.test(args[2]) || !args[2]) { return msg.channel.send(lang.cannotspace) }
    if (settings.ignoredChannels.includes(id)) return msg.channel.send(f(lang.antispam.status2, lang.disabled))
    msg.channel.send(f(lang.antispam.status2, lang.enabled))
  }
}
