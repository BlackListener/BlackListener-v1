const BlackListener = require('../../core')
const { contents: { validLanguages }, data, f } = BlackListener.commons
const { Component, Discord } = BlackListener

module.exports = class extends Component {
  constructor() {
    const opts = {
      args: [
        'ISO 639-1 Language Code(en, ja, and more)',
      ],
      permission: 8,
    }
    super('language', opts)
  }

  async _run(msg, settings, lang, args, opts) {
    const user = await data.user(opts.target || msg.author.id)
    if (!args[1] || args[1] === 'help') {
      const embed = new Discord.RichEmbed()
        .setTitle(f(lang.availablelang, user.language))
        .setDescription(validLanguages.join('\n'))
        .setColor([0,255,0])
      msg.channel.send(embed)
    } else if (validLanguages.includes(args[1])) {
      user.language = args[1]
      msg.channel.send(f(lang.setconfig, 'language'))
    }
  }
}
