module.exports.name = 'leave'

module.exports.isAllowed = msg => {
  return msg.author.id !== msg.guild.ownerID
}

module.exports.run = async function(msg) {
  await msg.channel.send(':wave:')
  msg.guild.leave()
}
