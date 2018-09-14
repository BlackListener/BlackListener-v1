const git = require('simple-git/promise')()
const logger = require('./logger').getLogger('VersionCheck', 'darkgray')

async function check() {
  await git.fetch()
  const status = await git.status()
  const latest = await (git.tags()).latest
  logger.info(`${status.behind} commit(s) behind (${status.current}...${status.tracking})`)
  if (latest !== await (git.tags()).latest) {
    logger.error('You are using outdated release.')
      .info(`Current running on: ${latest}`)
      .info(`Latest release: ${await (git.tags()).latest}`)
  }
  if (status.conflicted.length !== 0) logger.warn(`${status.conflicted.length} conflict(s) found!`)
  if (status.behind >= 15) logger.error(`You are using outdated commit, ${status.behind} commits behind.`)
    .error('Please update to latest commit.')
}

module.exports = check