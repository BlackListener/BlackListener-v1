const fs = require('fs')
const config = require('./config.json5')
const chalk = require('chalk')

class Logger {
  initLog() {
    this.initialized = true
    fs.writeFileSync('latest.log', `--- The log begin at ${new Date().toLocaleString()} ---\n`)
    this.info('The log file has initialized.', true)
    return this
  }
  getLogger(thread, color = 'yellow') {
    if (!this.initialized) {
      this.initLog()
    }
    const newLogger = new Logger()
    newLogger.thread = thread
    switch (color) {
      case 'yellow': newLogger.thread = chalk.bold.yellow(thread); break
      case 'darkgray': newLogger.thread = chalk.gray(thread); break
      case 'red': newLogger.thread = chalk.red(thread); break
      case 'lightred': newLogger.thread = chalk.bold.red(thread); break
      case 'green': newLogger.thread = chalk.green(thread); break
      case 'lightpurple': newLogger.thread = chalk.bold.hex('#800080')(thread); break
      case 'white': newLogger.thread = chalk.white(thread); break
      case 'cyan': newLogger.thread = chalk.cyan(thread); break
      case 'purple': newLogger.thread = chalk.hex('#800080')(thread); break
      case 'blue': newLogger.thread = chalk.blue(thread); break
    }
    this.info(`Registered logger for: ${thread}`, true)
    return newLogger
  }
  out(message, level, isLogger) {
    const originaldate = new Date()
    const date = chalk.cyan(`${originaldate.getFullYear()}-${originaldate.getMonth()}-${originaldate.getDate()} ${originaldate.getHours()}:${originaldate.getMinutes()}:${originaldate.getSeconds()}.${originaldate.getMilliseconds()}`) + chalk.reset()
    let thread = this.thread
    if (isLogger) { thread = 'logger'; thread = chalk.hex('#800080')(thread) }
    fs.appendFileSync('latest.log', `${date} ${thread}${chalk.reset()} ${level} ` + chalk.green(`${message}\n`) + chalk.reset())
    console.info(`${date} ${thread}${chalk.reset()} ${level}${chalk.reset()} ${chalk.green(message)}${chalk.reset()}`)
  }
  info(message, isLogger = false) {
    this.out(message, chalk.blue('info'), isLogger)
    return this
  }
  debug(message, isLogger = false) {
    if (config.debug) {
      this.out(message, chalk.cyan('debug'), isLogger)
    }
    return this
  }
  warn(message, isLogger = false) {
    this.out(message, chalk.bold.yellow('warn'), isLogger)
    return this
  }
  error(message, isLogger = false) {
    this.out(message, chalk.red('error'), isLogger)
    return this
  }
  fatal(message, isLogger = false) {
    this.out(message, chalk.redBright.bold('fatal'), isLogger)
    return this
  }
}

module.exports = new Logger()
