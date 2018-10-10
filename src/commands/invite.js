const f = require('string-format')
const isTravisBuild = process.argv.includes('--travis-build')
const s = isTravisBuild ? require(__dirname + '/../travis.yml') : require(__dirname + '/../secret.yml')
const c = require(__dirname + '/../config.yml')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('invite')
  }

  run(msg, settings, lang) {
    if (c.patron) return msg.channel.send('Invite: https://discordapp.com/oauth2/authorize?client_id=' + msg.client.user.id + '&permissions=8&redirect_uri=https%3A%2F%2Fapi.rht0910.tk%2Fpatronbot&scope=bot&response_type=code')
    msg.channel.send(f(lang.invite_bot, s.inviteme))
  }
}
