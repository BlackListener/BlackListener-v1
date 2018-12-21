const { commons: { f }, Component } = require('../../core')

module.exports = class extends Component {
  constructor() {
    super('prefix', { permission: 8 })
  }

  async _run(msg, settings, lang, args) {
    if (/\s/gm.test(args[1]) || !args[1]) {
      msg.channel.send(lang.cannotspace)
    } else {
      settings.prefix = args[1]
      await msg.channel.send(f(lang.setconfig, 'prefix'))
    }
  }
}
