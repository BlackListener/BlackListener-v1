const cs = require('../config/ConfigStore')
const f = require('string-format')
const { channelCheck } = require('./functions')

module.exports.name = 'setlog'

module.exports.alias = ['log']

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang, guildSettings) {
  const channel = channelCheck(msg, lang, settings)
  if (!channel) return msg.channel.send(lang.invalid_args)
  const id = channel.id
  settings.log_channel = id
  cs.store(guildSettings, settings)
  msg.channel.send(f(lang.setconfig, 'log_channel'))
}
