/* eslint no-use-before-define: 0 */
require('./src/yaml')
const logger = require('./src/logger').getLogger('main', 'green')
logger.info('Loaded core modules');
(async () => {
  logger.info('Checking for version')
  await require('./src/versioncheck')()
})()
logger.info('Starting')
const { fork } = require('child_process')
let spawned
let restart = false
const spawn = () => spawned = fork('src', process.argv.slice(2))
const register = () => {
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
    if (!restart) clearInterval(timer)
    if (code === 0) logger.info(`Bot exited: ${code}`)
    else logger.emerg(`Bot exited with unexpected code: ${code}`)
    if (!restart) process.exit(code)
    spawned.kill('SIGKILL')
    restart = false
  })
  
  process.on('SIGINT', () => {
    clearInterval(timer)
    logger.info('Caught SIGINT')
    logger.info('Stopping bot')
    setTimeout(() => {
      spawned.kill('SIGKILL')
    }, 5000)
    try {
      spawned.send('stop')
    } catch (e) {
      logger.error('Can\'t send message to client: ' + e)
    }
  })
}

const heartbeat = async () => {
  let received = false
  const handler = (msg) => {
    if (msg === 'ping') received = true
  }
  try {
    spawned.send('heartbeat')
  } catch (e) {
    logger.error('Can\'t send heartbeat')
  }
  spawned.once('message', handler)
  setTimeout(() => {
    if (!received) {
      logger.emerg('Looks like client is unusable(not responding), killing client, and attmpting restart')
      restart = true
      spawned.kill('SIGKILL')
    }
    received = false
    spawned.removeListener('message', handler)
  }, 250)
}

const timer = setInterval(heartbeat, 10000)

spawn()
register()
