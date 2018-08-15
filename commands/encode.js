module.exports = function(settings, msg) {
  const cmd = settings.prefix + 'encode '
  return msg.channel.send(new Buffer.from(msg.content.slice(cmd.length)).toString('base64'))
}
