const logger = require(__dirname + '/../logger').getLogger('commands:role')
const Discord = require('discord.js')
const { Command } = require('../core')

const addRole = (msg, rolename, guildmember = null, lang) => {
  let role; let member
  try {
    try {
      role = msg.guild.roles.find(n => n.name === rolename) || msg.guild.roles.get(rolename)
    } catch(e) { logger.error('An error occurred: ' + e) }
    if (!guildmember) { member = msg.guild.members.get(msg.author.id) } else { member = msg.guild.members.get(guildmember.id) }
    const build = function(title, message) {
      const embed = new Discord.RichEmbed().setTitle(title).setColor([255,0,0]).setDescription(lang.role.role + ' ``' + rolename + '`` ' + message)
      msg.channel.send(embed)
    }
    if (member.roles.has(role.id)) {
      member.removeRole(role).catch(e => logger.error(e))
      build(':x: ' + lang.role.title_removed, ' ' + lang.role.role_removed)
    } else {
      member.addRole(role).catch(e => logger.error(e))
      build(':white_check_mark: ' + lang.role.title_removed, ' ' + lang.role.role_added)
    }
  } catch (e) {
    msg.channel.send(lang.role_error); logger.error(e)
  }
}

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<Role> [User]',
      ],
      permission: 8,
    }
    super('role', opts)
  }

  run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (!msg.guild.roles.find(n => n.name === args[1] || n.id === args[1])) return msg.channel.send(lang.invalid_args)
    if (!msg.mentions.members.first()) {
      addRole(msg, args[1], null, lang)
    } else {
      addRole(msg, args[1], msg.mentions.members.first(), lang)
    }
  }
}
