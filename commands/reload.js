module.exports.name = 'reload'

module.exports.isAllowed = msg => {
  return msg.author.id == '254794124744458241'
}

module.exports.run = async function(msg, settings, lang) {
  await msg.channel.send(lang.rebooting)
  return process.kill(process.pid, 'SIGKILL')
}
