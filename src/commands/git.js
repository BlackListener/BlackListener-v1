const git = require('simple-git/promise')()
const { commons: { f }, Command } = require('../core')
const Components = require('../components')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: ['[update]'],
    }
    super('git', opts)
  }

  async run(msg, settings, lang, args) {
    await git.fetch()
    if (args[1] === 'update') return await (new Components.update()).run(msg, settings, lang)
    else if (args[1] === 'stash') {
      const message = await msg.channel.send(':stopwatch: Please wait...')
      await git.stash()
      return await message.edit(`:wastebasket: Stashed workspace. To revert: \`${settings.prefix}git pop\``)
    } else if (args[1] === 'pop') {
      const message = await msg.channel.send(':stopwatch: Please wait...')
      await git.stash(['pop'])
      return await message.edit(':white_check_mark: Popped workspace.')
    }
    const status = await git.status()
    const message = await msg.channel.send('Checking for version...')
    message.edit(f(lang.commit, await git.revparse(['HEAD']))
      + (status.behind === 0 ? (status.tracking ? '(:white_check_mark: Running latest version) ' : `(:question: Unknown branch in remote: \`${(await git.branch()).current})\` `) : `(${status.behind} commit(s) behind) `)
      + (status.isClean() ? '' : '[:warning: Pending commit] ')
      + (status.ahead === 0 ? '' : '[:warning: Pending push]'))
  }
}
