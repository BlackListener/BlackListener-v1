const Discord = require('discord.js')
const f = require('string-format')
const isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n) }
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '',
        'toggle',
        'disable',
        'enable',
        'ignore <Channel>',
        'status [Channel]',
      ],
      permission: 8,
    }
    super('antispam', opts)
  }

  async run(msg, settings, lang) {
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
        .addField(`${command} blacklist add <RegEx> (Not available)`, lang.antispam.blacklist.add)
        .addField(`${command} blacklist remove <number> (Not available)`, lang.antispam.blacklist.remove)
        .addField(`${command} blacklist list (Not available)`, lang.antispam.blacklist.list)
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
    } else if (args[1] === 'blacklist') {
      if (args[2] === 'add') {
        if (!args[3]) return msg.channel.send(lang.invalid_args)
        msg.channel.send('you') // you shall not pass
        setTimeout(() => msg.channel.send('shall not'), 1500)
        setTimeout(() => msg.channel.send('pass'), 3000)
        // settings.message_blacklist.push(args[3])
      } else if (args[2] === 'remove') {
        if (!args[3]) return msg.channel.send(lang.invalid_args)
        if (!isNumber(args[3])) return msg.channel.send(f('{0} is not a number.', args[3]))
        msg.channel.send('Oh, you got this message, it is not implemented!\n```javascript\nthrow new ReferenceError("Haha, not implemented!")\n// => ReferenceError: Haha, not implemented!\n```')
        // Delete settings.message_blacklist[parseInt(args[3])]
      } else if (args[2] === 'status') {
        msg.channel.send(':warning: This is implemented but unusable at this moment.')
        msg.channel.send(settings.message_blacklist.join('\n'))
        // This should be embed
      }
    } else {
      msg.channel.send(lang.invalid_args)
    }
  }
}
