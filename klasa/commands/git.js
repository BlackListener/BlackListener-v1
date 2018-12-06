const git = require('simple-git/promise')()
const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'git',
      args: '[action:str]',
    })
  }

  async run(msg) {
    const hash = await git.revparse(['HEAD'])
    const message = await msg.sendLocale('COMMAND_GIT_COMMIT', [hash + 'Checking for status...'])
    await git.fetch()
    const status = await git.status()
    if (msg.args[0] === 'update') {
      if (!status.tracking) return message.edit(`❌ Unknown branch in remote: \`${(await git.branch()).current}\``)
      if (status.behind === 0) return message.edit('✔ Already up to date.')
      if (!status.isClean()) return message.edit('❌ Workspace is not clean.')
      message.edit('♻ Updating...')
      const result = await git.pull().catch(e => {
        msg.sendLocale('_error', [e.message])
        logger.error(e)
        return false
      })
      if (!result) return message.edit('❌ Something went wrong. Try again.')
      if (result.files.length !== 0) {
        await Promise.all(this.client.pieceStores.map(async store => {
          await store.loadAll()
          await store.init()
        }))
        if (this.client.shard) {
          await this.client.shard.broadcastEval(`
            if (String(this.shard.id) !== '${this.client.shard.id}') this.client.pieceStores.map(async (store) => {
              await store.loadAll();
              await store.init();
            });
          `)
        }
      }
      message.edit('✔ Updated to latest version: ' + await git.revparse(['HEAD']))
    } else {
      msg.sendLocale('COMMAND_GIT_COMMIT', [hash
        + (status.behind === 0 ? (status.tracking ? '(✔ Running latest version) ' : `(❓ Unknown branch in remote: \`${(await git.branch()).current})\` `) : `(${status.behind} commit(s) behind) `)
        + (status.isClean() ? '' : '[⚠ Pending commit] ')
        + (status.ahead === 0 ? '' : '[⚠ Pending push]')])
    }
  }
}
