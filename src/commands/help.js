const f = require('string-format')
const Discord = require('discord.js')
const c = require(__dirname + '/../config.yml')
const util = require(__dirname + '/../util')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[Command]',
      ],
    }
    super('help', opts)
  }

  async run(msg, settings, lang, args) {
    const {commands} = require(__dirname + '/../commands')
    if (args[1]) {
      if (!commands[args[1]]) return msg.channel.send(f(lang.no_command, args[1]))
      const embed = new Discord.RichEmbed()
        .setTitle('About this command')
        .setDescription(
          (lang.commands[args[1]] || ' - Not available information - ')
          + `\n\nUsage: ${settings.prefix}${args[1]} ${await util.exists(`${__dirname}/${args[1]}.js`) ? (new (require(`${__dirname}/${args[1]}`))().args ? new (require(`${__dirname}/${args[1]}`))().args.join('\n') : '') : '<?>'}`
          + `\nAlias: ${await util.exists(`${__dirname}/${args[1]}.js`) ? (new (require(`${__dirname}/${args[1]}`))().alias ? new (require(`${__dirname}/${args[1]}`))().alias.join('\n') : lang.no) : '?'}`
          + `\n\nAlso see: http://docs.blacklistener.tk/ja/latest/commands/${args[1]}.html`)
        .setTimestamp()
        .setColor([0,255,0])
      return msg.channel.send(embed)
    }
    const prefix = settings.prefix
    const embed = new Discord.RichEmbed()
      .setTitle(f(lang.help.title, c.version))
      .setTimestamp()
      .setColor([0,255,0])
      .addField(`${prefix}setprefix`, lang.commands.setprefix)
      .addField(`${prefix}ban [<User> <Reason> <Probe>] | ${prefix}unban`, `${lang.commands.ban} | ${lang.commands.unban}`)
      .addField(`${prefix}language`, lang.commands.language)
      .addField(`${prefix}setnotifyrep | ${prefix}setbanrep`, `${lang.commands.setnotifyrep} | ${lang.commands.setbanrep}`)
      .addField(`${prefix}dump [guilds|users|channels|emojis|messages] [messages:delete/size]`, lang.commands.dump)
      .addField(`${prefix}invite`, lang.commands.invite)
      .addField(`${prefix}role <role> [user] __/__ ${prefix}autorole [add/remove] <role>`, `${lang.commands.role}\n${lang.commands.autorole}`)
      .addField(`${prefix}image [anime|custom] [subreddit]`, lang.commands.image)
      .addField(`${prefix}lookup <User>`, lang.lookup.description)
      .addField(lang.help.others, lang.help.athere)
    return msg.channel.send(embed)
  }
}
