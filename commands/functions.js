const util = require('../util')
const f = require('string-format')
const cs = require('../config/ConfigStore')

const functions = {
  channelCheck(msg, lang, settings) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    let channel
    if (msg.mentions.channels.first()) {
      channel = msg.mentions.channels.first()
    } else if (/\D/.test(args[1])) {
      channel = msg.guild.channels.find('name', args[1])
    } else if (/\d{18}/.test(args[1])) {
      channel = msg.guild.channels.get(args[1]) || msg.guild.channels.find('name', args[1])
    } else {
      channel = msg.guild.channels.find('name', args[1])
    }
    return channel
  },
  async loadSecret() {
    return await util.exists('./secret.yml') ? require('../secret.yml') : require('../travis.yml')
  },
  setrep(msg, lang, guildSettings, settings, notify) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    const n = parseInt(args[1], 10)
    const min = 0
    const max = 10
    const status = n >= min && n <= max
    if (!status || args[1] == null) {
      msg.channel.send(lang.invalid_args)
    } else {
      if (notify) settings.notifyRep = parseInt(args[1], 10); else settings.banRep = parseInt(args[1], 10)
      cs.store(guildSettings, settings)
      msg.channel.send(f(lang.setconfig, 'banRep'))
    }
  },
}

module.exports = functions