module.exports.name = 'reload'

module.exports.isAllowed = (msg, owners) => {
  return owners.includes(msg.author.id)
}

module.exports.run = async function(msg, settings, lang) {
  await msg.channel.send(lang.rebooting)
  return process.kill(process.pid, 'SIGKILL')
}
