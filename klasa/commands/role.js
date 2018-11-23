const Converter = require(__dirname + '/../converter.js')
const Discord = require('discord.js')
const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()
const f = require('string-format')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'role',
      usage: '<Role:role> <User:user>',
      permissionLevel: 6,
    })
  }

  run(msg, settings, lang, args) {
    const role = Converter.toRole(args[1])
    const member = Converter.toMember(msg, args[2])
    const build = (title, message) => {
      const embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setColor([255,0,0])
        .setDescription(f(message, args[1]))
      msg.channel.send(embed)
    }
    if (member.roles.has(role.id)) {
      member.removeRole(role).catch(e => logger.error(e))
      build(lang.COMMAND_ROLE_REMOVED_TITLE, lang.COMMAND_ROLE_REMOVED)
    } else {
      member.addRole(role).catch(e => logger.error(e))
      build(lang.COMMAND_ROLE_ADDED_TITLE, lang.COMMAND_ROLE_ADDED)
    }
  }
}
