require('./src/yaml')
const logger = require('./src/logger').getLogger('main', 'green')
logger.info('Loaded core modules')
logger.info('Checking for version in background')
require('./src/versioncheck')()
logger.info('Starting')
const { fork } = require('child_process')
const spawned = fork('src', [process.argv[2] || '', process.argv[3] || '', process.argv[4] || '', process.argv[5] || ''])

spawned.on('message', msg => {
  process.stdout.write(msg)
})

spawned.on('error', e => {
  logger.emerg('Failed to start Bot: ')
  logger.emerg(e.stack)
  process.exit(1)
})

spawned.on('close', (code) => {
  logger.info(`Bot exited: ${code}`)
  if (code >= 1 || code <= -1) logger.emerg(`Bot exited with unexpected code: ${code}`)
  process.exit(code)
})
process.on('SIGINT', () => {
  logger.info('Caught SIGINT')
  logger.info('Stopping bot')
  setTimeout(() => {
    spawned.kill('SIGTERM')
  }, 5000)
  spawned.send('stop')
})