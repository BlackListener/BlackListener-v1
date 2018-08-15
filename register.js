const logger = require('./logger').getLogger('main:event', 'purple')
const c = require('./config.json5')

module.exports = function(client) {
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
    logger.error(`Caught error: ${error}`)
    logger.error(error.stack)
  })

  client.on('rateLimit', (info, method) => {
    logger.fatal('==============================')
      .fatal('      Got rate limiting!      ')
      .fatal(` -> RateLimit: ${info.limit} seconds remaining`)
      .fatal(` Detected rate limit while processing '${method}' method.`)
      .fatal(` Rate limit information: ${JSON.stringify(info)} `)
      .fatal('==============================')
  })

  client.on('guildCreate', () => {
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  })

  let count = 0
  let once = false
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
