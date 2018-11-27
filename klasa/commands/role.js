const Discord = require('discord.js')
const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'role',
      usage: '<Role:role> <Member:member>',
      usageDelim: ' ',
      permissionLevel: 6,
    })
  }

  run(msg, [role, member]) {
    const build = (title, message) => {
      const embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setColor([255,0,0])
        .setDescription(message(role))
      msg.channel.send(embed)
    }
    if (member.roles.has(role.id)) {
      member.removeRole(role).catch(e => logger.error(e))
      build(msg.language.get('COMMAND_ROLE_REMOVED_TITLE'), msg.language.get('COMMAND_ROLE_REMOVED'))
    } else {
      member.addRole(role).catch(e => logger.error(e))
      build(msg.language.get('COMMAND_ROLE_ADDED_TITLE'), msg.language.get('COMMAND_ROLE_ADDED'))
    }
  }
}
