const logger = require('./logger').getLogger('main:event', 'purple')
const c = require(__dirname + '/config.yml')
const _fs = require('fs')
const fs = _fs.promises
const os = require('os')
const share = require(__dirname + '/share')
const git = require('simple-git/promise')()
const args = require(__dirname + '/argument_parser')(process.argv.slice(2))
const util = require('util')
const moment = require('moment')

const codeblock = code => '```' + code + '```'
const ucfirst = text => text.charAt(0).toUpperCase() + text.slice(1)

async function makeReport(client, error, type) {
  const description = type === 'error'
    ? 'Unhandled Rejection(Exception/Error in Promise).'
    : 'Uncaught error.'
  const format = moment().format('YYYY-MM-DD_HH.mm.ss')
  const argv = process.argv.map((val, index) => `arguments[${index}]: ${val}`)
  const commit = await git.revparse(['HEAD'])
  const data =  `
--- BlackListener ${ucfirst(type)} Report ---

Time: ${format}
Description: ${description}

${error.stack}

--- Process Details ---
    Last Called Logger Thread: ${share.thread} (may not current thread)

    BlackListener Version: ${c.version}
    BlackListener Commit: ${commit}

    Arguments: ${process.argv.length}
    ${argv.join('\n    ')}

    Launched in PID: ${process.pid}

    Remote control: ${args.rcon ? 'Enabled' : 'Disabled'}
    Custom Prefix: ${args.prefix || 'Disabled; using default value: '+c.prefix}

--- Discord.js ---
    Average ping of websocket: ${Math.floor(client.ping * 100) / 100}
    Last ping of websocket: ${client.pings[0]}
    Ready at: ${client.readyAt ? client.readyAt.toLocaleString() : 'Error on before getting ready'}

--- System Details ---
    CPU Architecture: ${process.arch}
    Platform: ${process.platform}
    Total Memory: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB
    Memory Usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB

--- Versions ---
    Node Version: ${process.versions.node}
    HTTP Parser Version: ${process.versions.http_parser}
    v8 Version: ${process.versions.v8}
    Unicode Version: ${process.versions.unicode}
    zlib Version: ${process.versions.zlib}
    OpenSSL Version: ${process.versions.openssl}
`
  return {
    report: data,
    file: `${__dirname}/../${type}-reports/${type}-${format}.txt`,
  }
}

module.exports = function(client) {
  let count = 0
  let errors = 0
  let once = false

  setInterval(() => {
    if (errors >= 2) {
      logger.emerg('Error loop detected, terminating this process')
      process.kill(process.pid, 'SIGKILL')
    }
    errors = 0
  }, 1000)

  client.on('warn', (warn) => {
    logger.warn(`Got Warning from Client: ${warn}`)
  })

  client.on('disconnect', () => {
    logger.info(`Disconnected from Websocket (${count}ms).`)
    if (count === 0)
      logger.fatal('May wrong your bot token, Is bot token has changed or Base64 encoded?')
        .info('Or are you attempted remote shutdown?')
    process.exit()
  })

  client.on('reconnecting', () => {
    logger.warn('Got Disconnected from Websocket, Reconnecting!')
  })

  client.on('error', (e) => {
    const err = typeof e == Object ? util.inspect(e) : e
    logger.fatal('Something went wrong: ' + err)
    logger.fatal(e.stack || e)
  })

  process.on('unhandledRejection', async (error = {}) => {
    errors++
    if (error.name === 'DiscordAPIError') return true // ignore DiscordAPIError (e.g. Missing Permissions)
    if ((error.message || '').includes('ENOTFOUND')) return // ignore network error
    const { report, file } = await makeReport(client, error, 'error')
    client.readyAt ? client.channels.get('484357084037513216').send(codeblock(report))
      .then(() => logger.info('Error report has been sent!')) : true
    logger.error(`Unhandled Rejection: ${error}`)
    logger.error(error.stack)
    fs.writeFile(file, report, 'utf8').then(() => {
      logger.info(`Error Report has been writed to ${file}`)
    })
  })

  process.on('uncaughtException', async (error = {}) => {
    errors++
    const { report, file } = await makeReport(client, error, 'crash')
    logger.emerg('Oh, BlackListener has crashed!')
      .emerg(`Crash report has writed to: ${file}`)
    _fs.writeFileSync(file, report, 'utf8')
    client.readyAt ? client.channels.get('484183865976553493').send(codeblock(report))
      .finally(() => process.exit(1)) : process.exit(1)
  })

  process.on('message', msg => {
    if (msg === 'heartbeat') process.send('ping')
  })

  client.on('rateLimit', (info, method) => {
    logger.error('==============================')
      .error('      Got rate limiting!      ')
      .error(` -> ${info.limit} seconds remaining`)
      .error(` Detected rate limit while processing '${method}' method.`)
      .error(` Rate limit information: ${JSON.stringify(info)} `)
      .error('==============================')
  })

  client.on('guildCreate', () => { // on created server, joined to a server, offline guild(s) back to online
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  })

  client.on('guildDelete', () => { // on kicked from server, deleted server
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  })

  process.on('SIGINT', () => {
    setInterval(() => {
      if (count <= 5000) {
        ++count
      } else { clearInterval(this) }
    }, 1)
    setTimeout(() => {
      logger.info('Exiting')
      process.exit()
    }, 5000)
    if (count != 0)
      if (!once) {
        logger.info('Caught INT signal')
        logger.info('Disconnecting')
        client.destroy()
        once = true
      } else {
        logger.info('Already you tried CTRL+C. Program will exit at time out(' + (5000 - count) / 1000 + ' seconds left) or disconnected')
      }
  })
}

logger.info('Registered all events.')
