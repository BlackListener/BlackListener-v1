module.exports.args = '<User>'

module.exports.name = 'instantkick'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = function(msg, settings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  msg.guild.members.get(args[1]).kick('Instant Kick by BlackListener by ' + msg.author.tag)
  msg.channel.send(':ok_hand:')
}
