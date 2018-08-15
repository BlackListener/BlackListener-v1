module.exports = async function(msg, lang) {
  if (msg.author.id !== '254794124744458241') return msg.channel.send(lang.udonthaveperm)
  await msg.channel.send(lang.rebooting)
  return process.kill(process.pid, 'SIGKILL')
}
