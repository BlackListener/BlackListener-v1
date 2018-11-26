const Discord = require('discord.js')
const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'purge',
      usage: '<all:default|gdel|gdelmsg|gdelreally|remake> (Channel:channel)',
      permissionLevel: 6,
    })
  }

  async run(msg, [type, ...params]) {
    if (settings.disable_purge) return msg.channel.send(lang.COMMAND_PURGE_DISABLED_PURGE)
    if (/[0-9]/.test(args[1])) {
      if (parseInt(args[1]) > 99 || parseInt(args[1]) < 1) {
        msg.channel.send(lang.COMMAND_PURGE_OUTOFRANGE)
      }
      const messages = await msg.channel.fetchMessages({limit: parseInt(args[1]) + 1})
      msg.channel.bulkDelete(messages)
        .catch(e => logger.error(e))
    } else return this[type](msg, params)
  }

  all(msg) {
    const clear = () => {
      msg.channel.fetchMessages()
        .then((messages) => {
          msg.channel.bulkDelete(messages)
          if (messages.length >= 100) {
            setTimeout(() => clear(), 3000)
          }
        })
    }
    clear()
  }

  gdel(msg) {
    msg.guild.channels.forEach((channel) => { channel.delete() })
    msg.guild.createChannel('general', 'text')
  }

  gdelmsg(msg) {
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
  }

  gdelreally(msg) {
    msg.guild.channels.forEach((channel) => { channel.delete() })
  }

  async remake(msg, [channel]) {
    if (!(channel instanceof Discord.TextChannel)) return msg.channel.send(lang._no_args)
    await channel.clone()
    await channel.delete('Remake of Channel')
    msg.channel.send(':ok_hand:')
  }
}
