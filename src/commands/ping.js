const f = require('string-format')

module.exports.name = 'ping'

module.exports.run = async function(msg, settings, lang) {
  const m = await msg.channel.send(lang.pinging)
  m.edit(f(lang.pong, m.createdTimestamp - msg.createdTimestamp, Math.round(msg.client.ping)))
}
