const fs = require('fs')
const config = require('./config.json5')
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
const SET='\033[0m'

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
    const date = `${CYAN}${originaldate.getFullYear()}-${originaldate.getMonth()}-${originaldate.getDate()} ${originaldate.getHours()}:${originaldate.getMinutes()}:${originaldate.getSeconds()}.${originaldate.getMilliseconds()}${SET}`
    let thread = this.thread; let color = this.color
    if (isLogger) { thread = 'logger'; color = PURPLE }
    fs.appendFileSync('latest.log', `${date} ${color}${thread} ${level} ${GREEN}${message}${SET}\n`)
    console.info(`${date} ${color}${thread} ${level} ${GREEN}${message}${SET}`)
  }
  info(message, isLogger = false) {
    this.out(message, `${BLUE}info`, isLogger)
    return this
  }
  debug(message, isLogger = false) {
    if (config.debug) {
      this.out(message, `${CYAN}debug`, isLogger)
    }
    return this
  }
  warn(message, isLogger = false) {
    this.out(message, `${YELLOW}warn`, isLogger)
    return this
  }
  error(message, isLogger = false) {
    this.out(message, `${RED}error`, isLogger)
    return this
  }
  fatal(message, isLogger = false) {
    this.out(message, `${LIGHTRED}fatal`, isLogger)
    return this
  }
}

module.exports = new Logger()
