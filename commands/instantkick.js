module.exports = function(msg, settings) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  msg.guild.members.get(args[1]).kick('Instant Kick by BlackListener by ' + msg.author.tag)
  msg.channel.send(':ok_hand:')
}
