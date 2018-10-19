/* eslint no-use-before-define: 0 */
if (parseInt(process.versions.node.split('.')[0]) < 10) {
  console.error('ERROR: You are running on Node.js v%s, but not supported this version!', process.versions.node.split('.')[0])
  process.exit(1)
}
require('./src/yaml')
const logger = require('./src/logger').getLogger('main', 'green')
const args = require('./src/argument_parser')(process.argv.slice(2))
const app = require('./config')
logger.info('Loaded core modules')
if (process.pid === 1 || args.debug.pid1) {
  logger.warn('=============== WARNING ===============')
    .warn('PID is 1, it may occur unexpected behavior! (And not supported)')
    .warn('=======================================')
}
if (args.debugg) logger.debug('You enabled debug option, and you\'ll see debug messages.');
(async () => {
  const util = require('./src/util')
  const fs = require('fs').promises
  if (await util.exists(__dirname + '/src/secret.yml')) {
    logger.info('Converting config')
    const data = await fs.readFile(__dirname + '/src/secret.yml')
    const configdata = await fs.readFile(__dirname + '/src/config.yml')
    await fs.appendFile(__dirname + '/src/config.yml', data)
    await fs.writeFile(__dirname + '/src/config.old.yml', configdata)
    await fs.rename(__dirname + '/src/secret.yml', __dirname + '/src/secret.old.yml')
    logger.warn('Completed converting, but Is this ok?')
      .warn('Please check "config.yml" carefully.')
      .info('Please re-run this when you have checked config file.')
    process.exit()
  }
  const config = require(__dirname + '/src/config.yml')
  if (!config.patroninvite) {
    let data = ''
    data += '\n# Patron bot invite - Do not edit if you aren\'t self hosted patron bot.\n'
    data += 'patroninvite: https://discordapp.com/oauth2/authorize?client_id=469114408501510166&permissions=8&redirect_uri=https%3A%2F%2Fapi.rht0910.tk%2Fpatronbot&scope=bot&response_type=code\n'
    fs.appendFile(__dirname + '/src/config.yml', data)
  }
  if (!config.config_version) {
    let data = ''
    data += '\n# DO NOT EDIT CONFIG VERSION ANYWAY.\n'
    data += 'config_version: \'1.0\'\n'
    fs.appendFile(__dirname + '/src/config.yml', data)
  }
  if (config.config_version) {
    logger.info(`Checking for config version [config:${config.config_version}, wanted: ${app.wanted_configversion}]`)
    /**
     * Actual version
     */
    const i1 = parseInt(config.config_version.replace(/\./gm, ''))
    /**
     * Expected version
     */
    const i2 = parseInt(app.wanted_configversion.replace(/\./gm, ''))
    if (i1 < i2) { // Config version is less than expected version
      const migrate = require(__dirname + '/src/config_migrate')
      logger.warn(`Your config version is outdated! (${config.config_version} < ${app.wanted_configversion})`)
      if (migrate.versions[`${config.config_version}-to-${app.wanted_configversion}`]) {
        logger.info(`Available update script: ${config.config_version}-to-${app.wanted_configversion}`)
        const result = await migrate.versions[`${config.config_version}-to-${app.wanted_configversion}`]()
        if (result) {
          logger.info('You need to review the your config.')
            .info('Please edit your config and re-run this.')
            .warn('IMPORTANT: Check your config.yml carefully(single/double quotations).')
          process.exit()
        } else {
          logger.info('Fully upgraded, and no review(s) needed.')
        }
      } else {
        logger.warn('No update scripts available.')
      }
    } else if (i1 > i2) { // Config version is greater than expected version
      logger.warn('Your config version is greater than expected version!')
        .warn('Are you time traveller? (or bug?)')
    } else {
      logger.info('Config version is up to date.')
    }
  }
  logger.info('Checking for version')
  await require('./src/versioncheck')()
})()
logger.info('Starting')
const { fork } = require('child_process')
let spawned
let restart = false
const spawn = () => spawned = fork('src', process.argv.slice(2))
const register = () => {
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
  
  const KILLINTHandler = () => {
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
  }

  spawned.on('message', msg => {
    if (msg !== 'ping' && msg !== 'stop') process.stdout.write(msg)
    if (msg === 'stop') KILLINTHandler()
  })
  process.on('SIGINT', KILLINTHandler)
  process.on('SIGTERM', KILLINTHandler)
  process.on('SIGHUP', KILLINTHandler)
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
