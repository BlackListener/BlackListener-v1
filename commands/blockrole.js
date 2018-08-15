const util = require('../util')

module.exports = async function(settings, msg, lang, guildSettings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const role = msg.guild.roles.find('name', args[1]) ? msg.guild.roles.find('name', args[1]) : msg.guild.roles.get(args[1])
  if (!role) return msg.channel.send(lang.notfound_role)
  if (settings.blocked_role.includes(role.id)) {
    let exe = false
    for (let i=0; i<=settings.blocked_role.length; i++) {
      if (settings.blocked_role[i] === role.id) {
        exe = true
        delete settings.blocked_role[i]
      }
    }
    if (!exe) { settings = null; return msg.channel.send(lang.notfound_role) }
    await util.writeSettings(guildSettings, settings, msg.channel, 'blocked_role')
  } else {
    settings.blocked_role.push(role.id)
    await util.writeSettings(guildSettings, settings, msg.channel, 'blocked_role')
  }
}
