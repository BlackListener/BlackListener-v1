module.exports.args = ['<User>']

module.exports.name = 'instantban'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = function(msg, settings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  msg.guild.ban(msg.client.users.get(args[1]))
  msg.channel.send(':ok_hand:')
}
