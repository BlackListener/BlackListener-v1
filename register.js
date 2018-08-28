const logger = require('./logger').getLogger('main:event', 'purple')
const c = require('./config.json5')
const fs = require('fs').promises
const os = require('os')

module.exports = function(client) {
  let count = 0
  let once = false

  client.on('warn', (warn) => {
    logger.warn(`Got Warning from Client: ${warn}`)
  })

  client.on('disconnect', () => {
    logger.info(`Disconnected from Websocket (${count}ms).`)
    process.exit()
  })

  client.on('reconnecting', () => {
    logger.fatal('Got Disconnected from Websocket, Reconnecting!')
  })

  process.on('unhandledRejection', (error) => {
    const date = new Date()
    const format = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`
    const file = `./crash-reports/crash-${format}.txt`
    let arguments = ''
    process.argv.forEach((val, index) => {
      arguments += `    arguments[${index}]: ${val}\n`
    })
    const data = `
--- BlackListener Crash Report ---

Time: ${format}
Description: Uncaught error. Error(s) detected in V8 engine. Please contact to developer.

${error.stack}

--- Process Details ---
    Thread: ${global.thread}

    BlackListener Version: ${c.version}
    BlackListener Build: ${c.build}

    Arguments: ${process.argv.length}
${arguments}

    Launched in PID: ${process.pid}

    Remote control: ${process.env.ENABLE_RCON ? 'Enabled' : 'Disabled'}
    Custom Prefix: ${process.env.BL_PREFIX ? process.env.BL_PREFIX : 'Disabled; using default value: '+c.prefix}

--- Discord.js ---
    Average ping of websocket: ${global.client.ping}
    Last ping of websocket: ${global.client.pings[0]}
    Ready at: ${global.client.readyAt.toLocaleString()}

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
    logger.fatal(`Unhandled error: ${error}`)
    logger.fatal(error.stack)
    logger.fatal('Attempting to disconnect from websocket')
    global.client.destroy().then(() => {
      logger.info('Disconnected from websocket.')
    })
    fs.writeFile(file, data, 'utf8').then(() => {
      logger.fatal(`Crash Report has been writed to ${file}`)
      process.exit(0)
    })
  })

  process.on('uncaughtException', (error) => {
    const date = new Date()
    const format = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`
    const file = `./crash-reports/crash-${format}.txt`
    let arguments = ''
    process.argv.forEach((val, index) => {
      arguments += `    arguments[${index}]: ${val}\n`
    })
    const data = `
--- BlackListener Crash Report ---

Time: ${format}
Description: Uncaught error. Error(s) detected in V8 engine. Please contact to developer.

${error.stack}

--- Process Details ---
    Thread: ${global.thread}

    BlackListener Version: ${c.version}
    BlackListener Build: ${c.build}

    Arguments: ${process.argv.length}
${arguments}

    Launched in PID: ${process.pid}

    Remote control: ${process.env.ENABLE_RCON ? 'Enabled' : 'Disabled'}
    Custom Prefix: ${process.env.BL_PREFIX ? process.env.BL_PREFIX : 'Disabled; using default value: '+c.prefix}

--- Discord.js ---
    Average ping of websocket: ${global.client.ping}
    Last ping of websocket: ${global.client.pings[0]}
    Ready at: ${global.client.readyAt.toLocaleString()}

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
    require('fs').writeFileSync(file, data, 'utf8')
    process.exit(1)
  })

  client.on('rateLimit', (info, method) => {
    logger.fatal('==============================')
      .fatal('      Got rate limiting!      ')
      .fatal(` -> ${info.limit} seconds remaining`)
      .fatal(` Detected rate limit while processing '${method}' method.`)
      .fatal(` Rate limit information: ${JSON.stringify(info)} `)
      .fatal('==============================')
  })

  client.on('guildCreate', () => {
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
        logger.info('Caught INT signal, shutdown.')
        client.destroy()
        once = true
      } else {
        logger.info('Already you tried CTRL+C. Program will exit at time out(' + (5000 - count) / 1000 + ' seconds left) or disconnected')
      }
  })
}

logger.info('Registered all events.')
