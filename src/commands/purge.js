const logger = require('../logger').getLogger('commands:purge', 'lightpurple')

module.exports.args = [
  '[number/all]',
  'gdel',
  'gdel-msg',
  'gdel-really',
  'remake <Channel>',
]

module.exports.name = 'purge'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (settings.disable_purge) return msg.channel.send(lang.disabled_purge)
  let messages
  if (args[1] === '' || !args[1] || args[1] === 'all') {
    const clear = () => {
      msg.channel.fetchMessages()
        .then((messages) => {
          msg.channel.bulkDelete(messages)
          if (messages.length >= 100) {
            clear()
          }
        })
    }
    clear()
  } else if (/[^0-9]/.test(args[1]) && args[1] === 'gdel-msg') {
    msg.guild.channels.forEach((channel) => {
      const clear = () => {
        channel.fetchMessages()
          .then((messages) => {
            channel.bulkDelete(messages)
            if (messages.length >= 100) {
              clear()
            }
          })
      }
      clear()
    })
  } else if (/[^0-9]/.test(args[1]) && args[1] === 'gdel') {
    msg.guild.channels.forEach((channel) => { channel.delete() })
    msg.guild.createChannel('general', 'text')
  } else if (/[^0-9]/.test(args[1]) && args[1] === 'gdel-really') {
    msg.guild.channels.forEach((channel) => { channel.delete() })
  } else if (args[1] === 'remake') {
    if (!msg.mentions.channels.first()) return msg.channel.send(lang.no_args)
    try {
      (async () => {
        const channel = msg.mentions.channels.first()
        msg.channel.send(':ok_hand:')
        channel.delete('Remake of Channel')
        const created_channel = await msg.guild.createChannel(channel.name, channel.type)
        if (channel.parent) {
          created_channel.setParent(channel.parentID)
        }
        created_channel.setPosition(channel.position)
      })()
    } catch (e) {
      logger.error(e)
    }
  } else if (/[0-9]/.test(args[1])) {
    if (parseInt(args[1]) > 99 || parseInt(args[1]) < 1) {
      msg.channel.send(lang.outofrange)
    }
    (async () => {
      messages = await msg.channel.fetchMessages({limit: parseInt(args[1]) + 1})
      msg.channel.bulkDelete(messages)
        .catch(e => logger.error(e))
    })()
  } else {
    msg.channel.send(lang.invalid_args)
  }
}
