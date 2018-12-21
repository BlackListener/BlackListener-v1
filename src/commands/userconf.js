const {
  commons: {
    f,
    argsresolver: argument_parser,
  },
  Command,
} = require('../core')
const Components = require('../components')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        'language',
        '[--target=<UserID>]',
      ],
      alias: [
        'userconfig',
      ],
    }
    super('userconf', opts)
  }

  async run(msg, settings, lang, args) {
    const opts = argument_parser(args.slice(1))
    if (opts.target) {
      if (!msg.member.hasPermission(8)) return msg.channel.send(':x: Administrators can only use this option.')
      else {
        if (msg.client.users.get(opts.target).bot) return msg.channel.send(':x: Specified user is bot.')
        msg.channel.send(':warning: User specified: ' + msg.client.users.get(opts.target).tag)
      }
    }
    if (Object.keys(Components.user_settings).includes(args[1]))
      return await (new Components.user_settings[args[1]]()).run(msg, settings, lang, args.slice(1))
    else
      return await msg.channel.send(f(lang['args_does_not_match'], Object.keys(Components.user_settings).join(', ')))
  }
}
