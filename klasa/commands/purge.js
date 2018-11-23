const Converter = require(__dirname + '/../converter.js')
const Klasa = require('klasa')
const logger = new Klasa.KlasaConsole()
const { Command } = Klasa

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'purge',
      args: [
        '[number/all]',
        'gdel',
        'gdel-msg',
        'gdel-really',
        'remake <Channel>',
      ],
      permissionLevel: 6,
    })
  }

  async run(msg, settings, lang, args) {
    if (settings.disable_purge) return msg.channel.send(lang.COMMAND_PURGE_DISABLED_PURGE)
    if (args[1] === '' || !args[1] || args[1] === 'all') {
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
      const channel = Converter.toTextChannel(msg, args[2])
      if (!channel) return msg.channel.send(lang._no_args)
      await channel.clone()
      await channel.delete('Remake of Channel')
      msg.channel.send(':ok_hand:')
    } else if (/[0-9]/.test(args[1])) {
      if (parseInt(args[1]) > 99 || parseInt(args[1]) < 1) {
        msg.channel.send(lang.COMMAND_PURGE_OUTOFRANGE)
      }
      const messages = await msg.channel.fetchMessages({limit: parseInt(args[1]) + 1})
      msg.channel.bulkDelete(messages)
        .catch(e => logger.error(e))
    } else {
      msg.channel.send(lang._invalid_args)
    }
  }
}
