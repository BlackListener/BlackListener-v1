const Logger = require('./Logger')
const chalk = require('chalk')
let init = false

/**
 * Set thread name and color.
 *
 * @example const logger = require('./logger').getLogger("example", "red")
 * @param {string} thread Thread name
 * @param {string} color Default: Random color, yellow, darkgray, red, lightred, green, lightpurple, white, cyan, purple, blue
 * @returns {Logger} A Logger instance
 */
const getLogger = (thread, color) => {
  const self = new Logger(init)
  init = true
  self.thread = thread
  self.thread_raw = thread
  const colors = [
    chalk.bold.yellow(thread),
    chalk.gray(thread),
    chalk.red(thread),
    chalk.bold.red(thread),
    chalk.green(thread),
    chalk.bold.hex('#800080')(thread),
    chalk.white(thread),
    chalk.cyan(thread),
    chalk.hex('#800080')(thread),
    chalk.blue(thread),
  ]
  switch (color) {
    case 'yellow': self.thread = colors[0]; break
    case 'darkgray': self.thread = colors[1]; break
    case 'red': self.thread = colors[2]; break
    case 'lightred': self.thread = colors[3]; break
    case 'green': self.thread = colors[4]; break
    case 'lightpurple': self.thread = colors[5]; break
    case 'white': self.thread = colors[6]; break
    case 'cyan': self.thread = colors[7]; break
    case 'purple': self.thread = colors[8]; break
    case 'blue': self.thread = colors[9]; break
    default: {
      self.thread = colors[Math.floor(Math.random() * colors.length)]
      break
    }
  }
  return self.info(`Registered logger for: ${thread}`, true)
}

module.exports = { getLogger }
