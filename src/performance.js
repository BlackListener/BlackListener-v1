const logger = require('./structures/util/LoggerFactory').getLogger('performance', 'orange')
const usage = require('usage')

setInterval(() => {
  usage.lookup(process.pid, (err, { memory, cpu }) => {
    logger.debug(`Memory usage: ${memory}  CPU usage: ${cpu.toFixed(3)}`)
  })
}, 5 * 60 * 1000)
