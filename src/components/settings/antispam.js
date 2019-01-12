const { commons: { f, config }, Component } = require('../../core')

module.exports = class extends Component {
  constructor() {
    const opts = {
      args: ['[[regex] <remove> <pattern or text>]', '[[regex] <add> <pattern or text>]', '[<ignore> <channelID or mention>]', 'disable', 'enable', '[regex] list', '<empty>'],
      permission: 8,
    }
    super('antispam', opts)
    this.blacklist_limit = 5
    this.blacklist_str_limit = config.patron ? 50000000000000 : 300
  }

  _run(msg, settings, lang, args) {

    if (args[1] === 'regex') {
      if (args[2] === 'remove') {
        if (!settings.antispam) return msg.channel.send(lang.antispam.enable_first)
        if (!args[3] || !settings.blacklist.includes(args[3])) return msg.channel.send(lang.invalid_args)
        settings.blacklist.splice(settings.blacklist.indexOf(args[3]), 1)
        msg.channel.send(f(lang.setconfig, 'blacklist'))
      } else if (args[2] === 'add') {
        if (!settings.antispam) return msg.channel.send(lang.antispam.enable_first)
        if (settings.blacklist.length >= this.blacklist_limit) return msg.channel.send(f(lang.antispam.limit, this.blacklist_limit.toString()))
        if (!args[3] || args[3].length < 4) return msg.channel.send(lang.invalid_args)
        if (settings.blacklist.includes(args[3])) return msg.channel.send(f(lang.setconfig, 'blacklist'))
        settings.blacklist.push(args[3])
        msg.channel.send(f(lang.setconfig, 'blacklist'))
      } else if (args[2] === 'list') {
        const data = settings.blacklist.join('\n')
        msg.channel.send(`This server using **${settings.blacklist.length}/${this.blacklist_limit}** patterns.\n\`\`\`\n`+data+'\n```')
      } else return msg.channel.send(lang.invalid_args + ` (Available args: \`${this.args.join(', ')}\`)`)
    } else if (args[1] === 'remove') {
      if (!settings.antispam) return msg.channel.send(lang.antispam.enable_first)
      if (!args[2] || !settings.blacklist_str.includes(args[2])) return msg.channel.send(lang.invalid_args)
      settings.blacklist_str.splice(settings.blacklist_str.indexOf(args[2]), 1)
      msg.channel.send(f(lang.setconfig, 'blacklist_str'))
    } else if (args[1] === 'add') {
      if (!settings.antispam) return msg.channel.send(lang.antispam.enable_first)
      if (settings.blacklist_str.length >= this.blacklist_str_limit) return msg.channel.send(f(lang.antispam.limit, this.blacklist_str_limit.toString()))
      if (!args[2] || args[2].length < 2) return msg.channel.send(lang.invalid_args)
      if (settings.blacklist_str.includes(args[2])) return msg.channel.send(f(lang.setconfig, 'blacklist_str'))
      settings.blacklist_str.push(args[2])
      msg.channel.send(f(lang.setconfig, 'blacklist_str'))
    } else if (args[1] === 'list') {
      const data = settings.blacklist_str.join('\n')
      msg.channel.send(`This server using **${settings.blacklist_str.length}/${this.blacklist_str_limit}** patterns.\n\`\`\`\n`+data+'\n```')
    } else if (args[1] === 'disable') {
      settings.antispam = false
      msg.channel.send(f(lang.setconfig, 'antispam'))
    } else if (args[1] === 'enable') {
      settings.antispam = true
      msg.channel.send(f(lang.setconfig, 'antispam'))
    } else if (args[1] === 'ignore') {
      if (!msg.guild.channels.has(args[2]) && !msg.mentions.channels.first()) return msg.channel.send(lang.invalid_args)
      settings.antispam_ignore = msg.guild.channels.has(args[2]) ? args[2] : msg.mentions.channels.first().id
      msg.channel.send(f(lang.setconfig, 'antispam_ignore'))
    } else {
      const _ = ` (Available args: \`${this.args.join(', ')}\`)`
      if (!settings.antispam) return msg.channel.send(lang.antispam.disabled+_)
      msg.channel.send(lang.antispam.enabled+_)
    }
  }
}
