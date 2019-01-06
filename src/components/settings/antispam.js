const { commons: { f }, Component } = require('../../core')

module.exports = class extends Component {
  constructor() {
    const opts = {
      args: ['[<remove> <regex>]', '[<add> <regex>]', 'disable', 'enable', 'list', '<empty>'],
      permission: 8,
    }
    super('antispam', opts)
    this.blacklist_limit = 5
  }

  _run(msg, settings, lang, args) {
    if (args[1] === 'remove') {
      if (!settings.antispam) return msg.channel.send(lang.antispam.enable_first)
      if (!args[2] || !settings.blacklist.includes(args[2])) return msg.channel.send(lang.invalid_args)
      settings.blacklist.splice(settings.blacklist.indexOf(args[2]), 1)
      msg.channel.send(f(lang.setconfig, 'blacklist'))
    } else if (args[1] === 'add') {
      if (!settings.antispam) return msg.channel.send(lang.antispam.enable_first)
      if (settings.blacklist.length >= this.blacklist_limit) return msg.channel.send(f(lang.antispam.limit, this.blacklist_limit.toString()))
      if (!args[2] || args[2].length < 4) return msg.channel.send(lang.invalid_args)
      if (settings.blacklist.includes(args[2])) return msg.channel.send(f(lang.setconfig, 'blacklist'))
      settings.blacklist.push(args[2])
      msg.channel.send(f(lang.setconfig, 'blacklist'))
    } else if (args[1] === 'list') {
      const data = settings.blacklist.map(b => '- '+b).join('\n')
      msg.channel.send(`This server using **${settings.blacklist.length}/${this.blacklist_limit}** regexes.\n\`\`\`\n`+data+'\n```')
    } else if (args[1] === 'disable') {
      settings.antispam = false
      msg.channel.send(f(lang.setconfig, 'antispam'))
    } else if (args[1] === 'enable') {
      settings.antispam = true
      msg.channel.send(f(lang.setconfig, 'antispam'))
    } else {
      const _ = ` (Available args: \`${this.args.join(', ')}\`)`
      if (!settings.antispam) return msg.channel.send(lang.antispam.disabled+_)
      msg.channel.send(lang.antispam.enabled+_)
    }
  }
}
