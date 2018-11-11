const f = require('string-format')
const git = require('simple-git/promise')()
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('git')
  }

  async run(msg, settings, lang) {
    const message = await msg.channel.send('Checking for version...')
    await git.fetch()
    const status = await git.status()
    const hash = await git.revparse(['HEAD'])
    message.edit(f(lang.commit, hash)
      + (status.behind === 0 ? '(✔ Running latest version) ' : `(${status.behind} commit(s) behind) `)
      + (status.isClean() ? '' : '[⚠ Pending commit]')
      + (status.ahead === 0 ? '' : '[⚠ Pending push]'))
  }
}
