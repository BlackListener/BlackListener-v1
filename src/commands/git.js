const f = require('string-format')
const git = require('simple-git/promise')()
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('git')
  }

  async run(msg, settings, lang) {
    const hash = await git.revparse(['HEAD'])
    msg.channel.send(f(lang.commit, hash))
  }
}
