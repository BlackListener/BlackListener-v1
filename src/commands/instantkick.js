const { toUser } = require(__dirname + '/../converter.js')

module.exports.args = ['<User>']

module.exports.name = 'instantkick'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = function(msg, settings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const user = toUser(msg, args[1])
  msg.guild.members.get(user.id).kick('Instant Kick by BlackListener by ' + msg.author.tag)
  msg.channel.send(':ok_hand:')
}
