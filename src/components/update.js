const git = require('simple-git/promise')()
const { commons: { f }, Component, LoggerFactory } = require('../core')
const { load } = require(__dirname + '/../commands')
const logger = LoggerFactory.getLogger('component:git', 'purple')

module.exports = class extends Component {
  constructor() {
    super('update', { required_args: false, registercmd: true })
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  async _run(msg, settings, lang) {
    const status = await git.status()
    const message = await msg.channel.send(':stopwatch: Checking for version...')
    if (!status.tracking) return message.edit(`:x: Unknown branch in remote: \`${(await git.branch()).current}\``)
    if (status.behind === 0) return message.edit(':white_check_mark: Already up to date.')
    if (!status.isClean()) return message.edit(':x: Workspace is not clean.')
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
    message.edit(':white_check_mark: Updated to latest version: ' + await git.revparse(['HEAD']))
  }
}
