const isRunning = require('is-running')
const fs = require('fs')
const logger = require('./logger').getLogger('pidcheck', 'yellow')

if (!fs.existsSync('blacklistener.pid')) {
  fs.writeFileSync('blacklistener.pid', process.pid)
  return
}
if (isRunning(fs.readFileSync('blacklistener.pid'))) {
  logger.error('Found another BlackListener(or corrupted pid file), can\'t start.')
  process.exit(-2)
} else {
  logger.error('BlackListener was interrupted, please check data directory is correct')
  logger.error('Starting')
}