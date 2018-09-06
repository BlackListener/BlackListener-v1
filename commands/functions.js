const functions = {
  channelCheck(msg, lang, settings) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    let channel
    if (msg.mentions.channels.first()) {
      channel = msg.mentions.channels.first()
    } else if (/\D/.test(args[1])) {
      channel = msg.guild.channels.find('name', args[1])
    } else if (/\d{18}/.test(args[1])) {
      try {
        channel = msg.guild.channels.get(args[1])
      } catch (e) {
        channel = msg.guild.channels.find('name', args[1])
      }
    } else {
      channel = msg.guild.channels.find('name', args[1])
    }
    return channel
  },
}

module.exports = functions