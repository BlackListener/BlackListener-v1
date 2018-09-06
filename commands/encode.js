module.exports.args = '<String>'

module.exports.name = 'encode'

module.exports.run = function(msg, settings) {
  const cmd = settings.prefix + 'encode '
  return msg.channel.send(new Buffer.from(msg.content.slice(cmd.length)).toString('base64'))
}
