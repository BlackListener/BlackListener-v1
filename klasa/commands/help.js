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
      if (!commands[args[1]]) return msg.channel.send(f(lang._no_command, args[1]))
      const embed = new Discord.MessageEmbed()
        .setTitle('About this command')
        .setDescription(
          (lang[`COMMAND_${args[1]}_DESCRIPTION`] || ' - Not available information - ')
          + `\n\nUsage: ${settings.prefix}${args[1]} ${await util.exists(`${__dirname}/${args[1]}.js`) ? (new (require(`${__dirname}/${args[1]}`))().args ? new (require(`${__dirname}/${args[1]}`))().args.join('\n') : '') : '<?>'}`
          + `\nAlias: ${await util.exists(`${__dirname}/${args[1]}.js`) ? (new (require(`${__dirname}/${args[1]}`))().alias ? new (require(`${__dirname}/${args[1]}`))().alias.join('\n') : lang._no) : '?'}`
          + `\n\nAlso see: http://docs.blacklistener.tk/ja/latest/commands/${args[1]}.html`)
        .setTimestamp()
        .setColor([0,255,0])
      return msg.channel.send(embed)
    }
    const prefix = settings.prefix
    const embed = new Discord.MessageEmbed()
      .setTitle(f(lang.COMMAND_HELP_TITLE, c.version))
      .setTimestamp()
      .setColor([0,255,0])
      .addField(`${prefix}setprefix`, lang.COMMAND_SETPREFIX_DESCRIPTION)
      .addField(`${prefix}ban [<User> <Reason> <Probe>] | ${prefix}unban`, `${lang.COMMAND_BAN_DESCRIPTION} | ${lang.COMMAND_UNBAN_DESCRIPTION}`)
      .addField(`${prefix}language`, lang.COMMAND_LANGUAGE_DESCRIPTION)
      .addField(`${prefix}setnotifyrep | ${prefix}setbanrep`, `${lang.COMMAND_SETNOTIFYREP_DESCRIPTION} | ${lang.COMMAND_SETBANREP_DESCRIPTION}`)
      .addField(`${prefix}dump [guilds|users|channels|emojis|messages] [messages:delete/size]`, lang.COMMAND_DUMP_DESCRIPTION)
      .addField(`${prefix}invite`, lang.COMMAND_INVITE_DESCRIPTION)
      .addField(`${prefix}role <role> [user] __/__ ${prefix}autorole [add/remove] <role>`, `${lang.COMMAND_ROLE_DESCRIPTION}\n${lang.COMMAND_AUTOROLE_DESCRIPTION}`)
      .addField(`${prefix}image [anime|custom] [subreddit]`, lang.COMMAND_IMAGE_DESCRIPTION)
      .addField(`${prefix}lookup <User>`, lang.COMMAND_LOOKUP_DESCRIPTION)
      .addField(lang.COMMAND_HELP_OTHERS, lang.COMMAND_HELP_ATHERE)
    return msg.channel.send(embed)
  }
}
