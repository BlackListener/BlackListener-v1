const logger = require(__dirname + '/../logger').getLogger('commands:role')
const Discord = require('discord.js')

const addRole = (msg, rolename, guildmember = null, language) => {
  const lang = require(`./lang/${language}.json`)
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

module.exports.args = ['<Role> [User]']

module.exports.name = 'role'

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (!msg.guild.roles.find(n => n.name === args[1] || n.id === args[1]))
    return msg.channel.send(lang.invalid_args)
  // msg.member.highestRole.position > role.position
  if (msg.member.hasPermission(8)) {
    if (!msg.mentions.members.first()) {
      addRole(msg, args[1], null, settings.language)
    } else {
      addRole(msg, args[1], msg.mentions.members.first(), settings.language)
    }
  } else {
    return msg.channel.send(lang.udonthaveperm)
  }
}
