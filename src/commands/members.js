module.exports.name = 'members'

module.exports.run = function(msg) {
  return msg.channel.send(msg.guild.members.size)
}
