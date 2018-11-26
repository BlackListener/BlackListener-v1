const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      usage: '<Channel:channel>',
      permissionLevel: 6,
    })
  }

  async run(msg, [channel]) {
    await channel.clone()
    await channel.delete('Remake of Channel')
    msg.channel.send(':ok_hand:')
  }
}
