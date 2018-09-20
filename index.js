require('./src/yaml')
const logger = require('./src/logger').getLogger('main', 'green')
logger.info('Loaded core modules')
const fs = require('fs')
logger.info('Checking for version')
const interrupted = () => {
  logger.error('BlackListener was interrupted, please check data directory is correct')
  logger.error('Starting')
}

if (fs.existsSync('blacklistener.pid')) {
  try {
    const pid = parseInt(fs.readFileSync('blacklistener.pid'), 10)
    if (process.kill(pid, 0)) {
      logger.error('Found another BlackListener(or corrupted pid file), can\'t start.')
      process.exit(-2)
    } else interrupted()
  } catch(e) { interrupted() }
}

logger.info('Starting')
const { fork } = require('child_process')
const spawned = fork('src', process.argv.slice(2))
fs.writeFileSync('blacklistener.pid', spawned.pid)

const heartbeat = async () => {
  let received = false
  spawned.send('heartbeat')
  spawned.on('message', msg => {
    if (msg === 'ping') received = true
  })
  setTimeout(() => {
    if (!received) {
      logger.emerg('Looks like client is unusable(not responding), killing client and restarting.')
      spawned.kill('SIGKILL')
      process.exit(1)
    }
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
    spawned.kill('SIGTERM')
  }, 5000)
  spawned.send('stop')
})
