const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'listemojis',
      usage: '[escape]',
    })
  }

  run(msg) {
    const emojiList = msg.guild.emojis.map(e=>e.toString()).join(' ')
    if (args[1] === 'escape') {
      msg.channel.send(`\`\`\`${emojiList}\`\`\``)
    } else {
      msg.channel.send(emojiList)
    }
  }
}
