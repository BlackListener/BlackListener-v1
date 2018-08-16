const fs = require('fs')
const config = require('./config.json5')
const chalk = require('chalk')
const DARKGRAY='\033[1;30m'
const RED='\033[0;31m'
const LIGHTRED='\033[1;31m'
const GREEN='\033[0;32m'
const YELLOW='\033[1;33m'
const BLUE='\033[0;34m'
const PURPLE='\033[0;35m'
const LIGHTPURPLE='\033[1;35m'
const CYAN='\033[0;36m'
const WHITE='\033[1;37m'

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
      case 'yellow': newLogger.color = YELLOW; break
      case 'darkgray': newLogger.color = DARKGRAY; break
      case 'red': newLogger.color = RED; break
      case 'lightred': newLogger.color = LIGHTRED; break
      case 'green': newLogger.color = GREEN; break
      case 'lightpurple': newLogger.color = LIGHTPURPLE; break
      case 'white': newLogger.color = WHITE; break
      case 'cyan': newLogger.color = CYAN; break
      case 'purple': newLogger.color = PURPLE; break
    }
    this.info(`Registered logger for: ${thread}`, true)
    return newLogger
  }
  out(message, level, isLogger) {
    const originaldate = new Date()
    const date = chalk.cyan(`${originaldate.getFullYear()}-${originaldate.getMonth()}-${originaldate.getDate()} ${originaldate.getHours()}:${originaldate.getMinutes()}:${originaldate.getSeconds()}.${originaldate.getMilliseconds()}`) + chalk.reset()
    let thread = this.thread; let color = this.color
    if (isLogger) { thread = 'logger'; color = PURPLE }
    fs.appendFileSync('latest.log', `${date} ${color}${thread} ${level} ` + chalk.green(`${message}\n`))
    console.info(`${date} ${color}${thread} ${level} ` + chalk.green(message))
  }
  info(message, isLogger = false) {
    this.out(message, chalk.blue(`info`), isLogger)
    return this
  }
  debug(message, isLogger = false) {
    if (config.debug) {
      this.out(message, chalk.cyan(`debug`), isLogger)
    }
    return this
  }
  warn(message, isLogger = false) {
    this.out(message, chalk.yellow(`warn`), isLogger)
    return this
  }
  error(message, isLogger = false) {
    this.out(message, chalk.red(`error`), isLogger)
    return this
  }
  fatal(message, isLogger = false) {
    this.out(message, chalk.redBright.bold(`fatal`), isLogger)
    return this
  }
}

module.exports = new Logger()
