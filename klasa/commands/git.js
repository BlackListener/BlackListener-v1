const git = require('simple-git/promise')()
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'git',
    })
  }

  async run(msg) {
    const hash = await git.revparse(['HEAD'])
    const message = await msg.sendLocale('COMMAND_GIT_COMMIT', [hash]) + 'Checking for status...'
    await git.fetch()
    const status = await git.status()
    message.edit(msg.language.get('COMMAND_GIT_COMMIT', hash)
      + (status.behind === 0 ? '(✔ Running latest version) ' : `(${status.behind} commit(s) behind) `)
      + (status.isClean() ? '' : '[⚠ Pending commit]')
      + (status.ahead === 0 ? '' : '[⚠ Pending push]'))
  }
}
