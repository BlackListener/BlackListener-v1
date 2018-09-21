require('./src/yaml')
const logger = require('./src/logger').getLogger('main', 'green')
logger.info('Loaded core modules')
const { Thread } = require('thread')
new Thread(async () => {
  logger.info('Checking for version')
  await require('./src/versioncheck')()
}).start()
logger.info('Starting')
const { fork } = require('child_process')
const spawned = fork('src', process.argv.slice(2))

const heartbeat = async () => {
  let received = false
  const handler = (msg) => {
    if (msg === 'ping') received = true
  }
  spawned.send('heartbeat')
  spawned.once('message', handler)
  setTimeout(() => {
    if (!received) {
      logger.emerg('Looks like client is unusable(not responding), killing client.')
      spawned.kill('SIGKILL')
    }
    received = false
    spawned.removeListener('message', handler)
  }, 250)
}

const timer = setInterval(heartbeat, 10000)

spawned.on('message', msg => {
  if (msg !== 'ping') process.stdout.write(msg)
})

spawned.on('error', e => {
  clearInterval(timer)
  logger.emerg('Failed to start Bot: ')
  logger.emerg(e.stack)
  process.exit(1)
})

spawned.on('close', (code) => {
  clearInterval(timer)
  if (code === 0) logger.info(`Bot exited: ${code}`)
  else logger.emerg(`Bot exited with unexpected code: ${code}`)
  process.exit(code)
})

process.on('SIGINT', () => {
  clearInterval(timer)
  logger.info('Caught SIGINT')
  logger.info('Stopping bot')
  setTimeout(() => {
    spawned.kill('SIGKILL')
  }, 5000)
  spawned.send('stop')
})
