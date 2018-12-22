const {
  commons: {
    f,
    data,
  },
  Command,
  Discord: { RichEmbed },
} = require('../core')
const Components = require('../components')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[--target=<UserID>]',
        '[-r](reset)',
        'list',
      ],
      alias: [
        'userconfig',
      ],
    }
    super('userconf', opts)
  }

  async run(msg, settings, lang, args, opts) {
    const user = await data.user(opts.target || msg.author.id)
    if (opts.target) {
      if (!msg.member.hasPermission(8)) return msg.channel.send(lang.youdonthavear)
      else {
        if (!msg.client.users.has(opts.target)) return msg.channel.send(':x: Unknown target user.')
        if (msg.client.users.get(opts.target).bot) return msg.channel.send(':x: Specified user is bot.')
        msg.channel.send(':warning: User specified: ' + msg.client.users.get(opts.target).tag)
      }
    }
    if (opts.flags.has('r')) {
      user.language = null
      return msg.react('👍')
    }
    if (args[1] === 'list') {
      return await msg.channel.send(new RichEmbed()
        .setTitle('User config')
        .setTimestamp()
        .addField('language', user.language))
    } else if (Object.keys(Components.user_settings).includes(args[1]))
      return await (new Components.user_settings[args[1]]()).run(msg, settings, lang, args.slice(1), opts)
    else
      return await msg.channel.send(f(lang['args_does_not_match'], Object.keys(Components.user_settings).concat(this.args).join(', ')))
  }
}
