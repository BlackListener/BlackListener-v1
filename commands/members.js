module.exports = function(msg) {
  return msg.channel.send(msg.guild.members.size)
}
