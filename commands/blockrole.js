const cs = require('../config/ConfigStore')
const f = require('string-format')

module.exports.name = 'blockrole'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const role = msg.guild.roles.find('name', args[1]) ? msg.guild.roles.find('name', args[1]) : msg.guild.roles.get(args[1])
  if (!role) return msg.channel.send(lang.role_error)
  if (settings.blocked_role.includes(role.id)) {
    let exe = false
    for (let i=0; i<=settings.blocked_role.length; i++) {
      if (settings.blocked_role[i] === role.id) {
        exe = true
        delete settings.blocked_role[i]
      }
    }
    if (!exe) { settings = null; return msg.channel.send(lang.role_error) }
    cs.store(guildSettings, settings)
    msg.channel.send(f(lang.setconfig, 'blocked_role'))
  } else {
    settings.blocked_role.push(role.id)
    cs.store(guildSettings, settings)
    msg.channel.send(f(lang.setconfig, 'blocked_role'))
  }
}
