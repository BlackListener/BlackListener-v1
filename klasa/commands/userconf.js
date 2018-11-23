
const Discord = require('discord.js')
const f = require('string-format')
const { validLanguages } = require(__dirname + '/../contents')
const argument_parser = require(__dirname + '/../argument_parser')
const data = require(__dirname + '/../data')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    const opts = {
      args: [
        'language',
        '[--target=<UserID>]',
      ],
      alias: [
        'userconfig',
      ],
    }
    super(...args, 'userconf', opts)
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
    const user = await data.user(opts.target || msg.author.id)
    if (args[1] === 'language') {
      if (!args[2] || args[2] === 'help') {
        const embed = new Discord.MessageEmbed()
          .setTitle(f(lang.COMMAND_USERCONF_AVAILABLELANG, user.language))
          .setDescription(validLanguages.join('\n'))
          .setColor([0,255,0])
        msg.channel.send(embed)
      } else if (validLanguages.includes(args[2])) {
        user.language = args[2]
        await msg.channel.send(f(lang._setconfig, 'language'))
      }
    } else msg.channel.send(lang._invalid_args)
  }
}
