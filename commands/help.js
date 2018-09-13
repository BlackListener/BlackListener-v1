const f = require('string-format')
const Discord = require('discord.js')
const c = require('../config.yml')
const util = require('../util')

module.exports.args = ['[Command]']

module.exports.name = 'help'

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (args[1]) {
    const commands = require(`../lang/commands/${settings.language}.json`)
    if (!commands[args[1]]) return msg.channel.send(f(lang.no_command, args[1]))
    const help = await util.readJSON(`./commands/${args[1]}.js`, {})
    const embed = new Discord.RichEmbed()
      .setTitle('About this command')
      .setDescription(
        commands[args[1]]
        + `\n\nUsage: ${settings.prefix}${args[1]} ${help === {} ? (help.args ? help.args.join('\n') : '') : '<?>'}`
        + `\nAlias: ${help === {} ? (help.alias ? help.alias.join('\n') : lang.no) : '?'}`
        + `\n\nAlso see: http://docs.blacklistener.tk/ja/latest/commands/${args[1]}.html`)
      .setTimestamp()
    return msg.channel.send(embed)
  }
  const prefix = settings.prefix
  const embed = new Discord.RichEmbed()
    .setTitle(f(lang.commands.title, c.version))
    .setTimestamp()
    .setColor([0,255,0])
    .addField(`${prefix}setprefix`, lang.commands.setprefix)
    .addField(`${prefix}ban [<User> <Reason> <Probe>] | ${prefix}unban`, `${lang.commands.ban} | ${lang.commands.unban}`)
    .addField(`${prefix}language`, lang.commands.language)
    .addField(`${prefix}setnotifyrep | ${prefix}setbanrep`, `${lang.commands.setnotifyrep} | ${lang.commands.setbanrep}`)
    .addField(`${prefix}antispam`, lang.commands.antispam)
    .addField(`${prefix}dump [guilds|users|channels|emojis|messages] [messages:delete/size]`, lang.commands.dump)
    .addField(`${prefix}invite`, lang.commands.invite)
    .addField(`${prefix}role <role> [user] __/__ ${prefix}autorole [add/remove] <role>`, `${lang.commands.role}\n${lang.commands.autorole}`)
    .addField(`${prefix}image [nsfw|anime|custom] [subreddit]`, lang.commands.image)
    .addField(`${prefix}lookup <User>`, lang.lookup.desc)
    .addField(lang.commands.others, lang.commands.athere)
  return msg.channel.send(embed)
}
