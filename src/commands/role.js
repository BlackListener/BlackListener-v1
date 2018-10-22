const logger = require(__dirname + '/../logger').getLogger('commands:role')
const Discord = require('discord.js')
const { Command } = require('../core')

const addRole = (msg, rolename, guildmember = null, lang) => {
  let role; let member
  try {
    try {
      role = msg.guild.roles.find(n => n.name === rolename) || msg.guild.roles.get(rolename)
    } catch(e) { logger.error('An error occurred in \'addRole\': ' + e) }
    if (!guildmember) { member = msg.guild.members.get(msg.author.id) } else { member = msg.guild.members.get(guildmember.id) }
    const build = function(title, message) {
      const embed = new Discord.RichEmbed().setTitle(title).setColor([255,0,0]).setDescription('Role ``' + rolename + '`` ' + message)
      msg.channel.send(embed)
    }
    if (member.roles.has(role.id)) {
      member.removeRole(role).catch(e => logger.error(e))
      build('<:tickNo:315009174163685377> Removed role from user', ' removed from user')
    } else {
      member.addRole(role).catch(e => logger.error(e))
      build('<:tickYes:315009125694177281> Added role to user', ' added to user')
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
