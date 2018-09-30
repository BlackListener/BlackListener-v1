const { toUser } = require(__dirname + '/../converter.js')

module.exports.args = ['<User>']

module.exports.name = 'instantban'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = function(msg, settings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const user = toUser(msg, args[1])
  msg.guild.ban(user)
  msg.channel.send(':ok_hand:')
}
