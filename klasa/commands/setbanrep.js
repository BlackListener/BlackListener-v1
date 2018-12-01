const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'setbanrep',
      usage: '<rep:number{0,10}>',
      aliases: [
        'banrep',
      ],
      permissionLevel: 6,
    })
  }

  async run(msg, [rep]) {
    await msg.guild.settings.update('banRep', rep)
    msg.sendLocale('_setconfig', ['banRep'])
  }
}
