const util = require('../util')

module.exports = function(settings, msg, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  let role
  try {
    role = msg.guild.roles.find('name', args[1])
  } catch (e) {
    try {
      role = msg.guild.roles.get(args[1])
    } catch (e) {
      return msg.channel.send(lang.invalid_args)
    }
  }
  if (msg.member.highestRole.position > role.position || msg.member.hasPermission(8)) {
    if (!msg.member.hasPermission(8)) if (settings.blocked_role.includes(args[1])) return msg.channel.send(lang.udonthaveperm)
    if (!msg.mentions.members.first()) {
      util.addRole(msg, args[1], true, null, settings.language)
    } else {
      util.addRole(msg, args[1], true, msg.mentions.members.first(), settings.language)
    }
  } else {
    return msg.channel.send(lang.no_perm)
  }
}
