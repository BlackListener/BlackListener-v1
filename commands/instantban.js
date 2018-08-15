module.exports = function(settings, msg) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  msg.guild.ban(msg.client.users.get(args[1]))
  msg.channel.send(':ok_hand:')
}
