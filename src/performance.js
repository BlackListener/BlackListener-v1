const logger = require(__dirname + '/logger').getLogger('performance', 'orange')
const usage = require('usage')

setInterval(() => {
  usage.lookup(process.pid, (err, { memory, cpu }) => {
    logger.debug(`Memory usage: ${memory}  CPU usage: ${cpu.toFixed(3)}`)
  })
}, 5 * 60 * 1000)
