const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'listemojis',
      usage: '[escape]',
    })
  }

  run(msg, [escape]) {
    const emojiList = msg.guild.emojis.map(e=>e.toString()).join(' ')
    if (escape) {
      msg.channel.send(`\`\`\`${emojiList}\`\`\``)
    } else {
      msg.channel.send(emojiList)
    }
  }
}
