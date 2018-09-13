const git = require('simple-git/promise')()
const logger = require('./logger').getLogger('VersionCheck', 'darkgray')

async function check() {
  logger.info('Checking for version...')
  await git.fetch()
  const status = await git.status()
  logger.info(`${status.behind} commit(s) behind (${status.current}...${status.tracking})`)
  if (status.conflicted.length !== 0) logger.warn(`${status.conflicted.length} conflict(s) found!`)
  if (status.behind >= 15) logger.error(`You are using outdated commit, ${status.behind} commits behind.`)
    .error('Please update to latest commit.')
}

module.exports = check