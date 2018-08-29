module.exports = async function(msg, lang) {
  if (msg.author.id !== '254794124744458241' && msg.author.id !== msg.guild.ownerID) return msg.channel.send(lang.no_permission)
  await msg.channel.send(':wave:')
  msg.guild.leave()
  return true
}
