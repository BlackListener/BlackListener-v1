const f = require('string-format')
const git = require('simple-git/promise')()
const { Command } = require('../core')
const { load } = require(__dirname + '/../commands')
const logger = require(__dirname + '/../logger').getLogger('commands:git', 'purple')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: ['[update]'],
    }
    super('git', opts)
  }

  async run(msg, settings, lang, args) {
    const message = await msg.channel.send('Checking for version...')
    await git.fetch()
    const status = await git.status()
    if (args[1] === 'update') {
      if (!status.tracking) return message.edit(`❌ Unknown branch in remote: \`${(await git.branch()).current}\``)
      if (status.behind === 0) return message.edit('✔ Already up to date.')
      if (!status.isClean()) return message.edit('❌ Workspace is not clean.')
      message.edit('♻ Updating...')
      const result = await git.pull().catch(e => {
        message.edit(f(lang.error, e))
        logger.error(e)
        return false
      })
      if (!result) return
      result.files.forEach(file => {
        load(file)
        logger.info(f(lang.load.loaded, file))
      })
      message.edit('✔ Updated to latest version: ' + await git.revparse(['HEAD']))
    } else {
      message.edit(f(lang.commit, await git.revparse(['HEAD']))
        + (status.behind === 0 ? (status.tracking ? '(✔ Running latest version) ' : `(❓ Unknown branch in remote: \`${(await git.branch()).current})\` `) : `(${status.behind} commit(s) behind) `)
        + (status.isClean() ? '' : '[⚠ Pending commit] ')
        + (status.ahead === 0 ? '' : '[⚠ Pending push]'))
    }
  }
}
