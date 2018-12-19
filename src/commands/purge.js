const { Command, Logger, Converter } = require('../core')
const logger = Logger.getLogger('commands:purge', 'lightpurple')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[number/all]',
        'gdel',
        'gdel-msg',
        'gdel-really',
        'remake <Channel>',
      ],
      permission: 8,
    }
    super('purge', opts)
    this.confirm = {}
    this.confirmremake = {}
  }

  async run(msg, settings, lang, args) {
    if (settings.disable_purge) return msg.channel.send(lang.disabled_purge)
    if (args[1] === '' || !args[1] || args[1] === 'all') {
      this.confirm[msg.author.id] = async () => {
        !(await msg.channel.clone()).setPosition(msg.channel.position)
        await msg.channel.delete('Remake of Channel')
        this.confirm[msg.author.id] = null
      }
      setTimeout(() => {
        this.confirm[msg.author.id] = null
      }, 10000)
      msg.channel.send('Are you sure? (It will remake this channel!!!)\nIf you sure, please enter `'+settings.prefix+'purge confirm`.\n10 seconds to expire.')
    } else if (args[1] === 'confirm') {
      if ((!this.confirm && !this.confirmremake) || (!this.confirm[msg.author.id] && !this.confirmremake[msg.author.id])) return msg.channel.send('There is no confirm required operations or expired.')
      if (this.confirm[msg.author.id]) return await this.confirm[msg.author.id]().catch(e => msg.channel.send(`Error: \`${e}\``))
      await this.confirmremake[msg.author.id]().catch(e => msg.channel.send(`Error: \`${e}\``))
    } else if (args[1] === 'remake') {
      const channel = Converter.toTextChannel(msg, args[2])
      if (!channel) return msg.channel.send(lang.no_args)
      this.confirmremake[msg.author.id] = async () => {
        !(await channel.clone()).setPosition(channel.position)
        await channel.delete('Remake of Channel')
        this.confirmremake[msg.author.id] = null
      }
      setTimeout(() => {
        this.confirmremake[msg.author.id] = null
      }, 10000)
      msg.channel.send('Are you sure?\nIf you sure, please enter `'+settings.prefix+'purge confirm`.\n10 seconds to expire.')
    } else if (/[0-9]/.test(args[1])) {
      if (parseInt(args[1]) > 99 || parseInt(args[1]) < 1) return msg.channel.send(lang.outofrange)
      const messages = await msg.channel.fetchMessages({limit: parseInt(args[1]) + 1})
      msg.channel.bulkDelete(messages)
        .catch(e => logger.error(e))
    } else {
      msg.channel.send(lang.invalid_args)
    }
  }
}
