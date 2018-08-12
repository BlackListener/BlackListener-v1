const fs = require('fs')
const config = require('./config.json5')

class Logger {
  initLog() {
    this.initialized = true
    fs.writeFileSync('latest.log', `--- The log begin at ${new Date().toLocaleString()} ---\n`)
    this.info('The log file has initialized.', true)
    return this
  }
  getLogger(thread) {
    if (!this.initialized) {
      this.initLog()
    }
    this.info(`Added logger for: ${thread}`, true)
    let newLogger = new Logger();
    newLogger.thread = thread
    return newLogger;
  }
  info(message, isLogger = false) {
    let thread = this.thread
    if (isLogger) thread = 'logger'
    if (config.loglevel > 2) return this
    fs.appendFileSync('latest.log', `[${thread}/INFO] ${message}\n`)
    if (config.consoleloglevel > 2) return this
    console.info(`[${thread}/INFO] ${message}`)
    return this
  }
  warn(message, isLogger = false) {
    let thread = this.thread
    if (isLogger) thread = 'logger'
    if (config.loglevel > 3) return this
    fs.appendFileSync('latest.log', `[${thread}/WARN] ${message}\n`)
    if (config.consoleloglevel > 3) return this
    console.warn(`[${thread}/WARN] ${message}`)
    return this
  }
  error(message, isLogger = false) {
    let thread = this.thread
    if (isLogger) thread = 'logger'
    if (config.loglevel > 4) return this
    fs.appendFileSync('latest.log', `[${thread}/ERROR] ${message}\n`)
    if (config.consoleloglevel > 4) return this
    console.error(`[${thread}/ERROR] ${message}`)
    return this
  }
  debug(message, isLogger = false) {
    let thread = this.thread
    if (isLogger) thread = 'logger'
    if (config.loglevel > 1) return this
    fs.appendFileSync('latest.log', `[${thread}/DEBUG] ${message}\n`)
    if (config.consoleloglevel > 1) return this
    console.debug(`[${thread}/DEBUG] ${message}`)
    return this
  }
  fatal(message, isLogger = false) {
    let thread = this.thread
    if (isLogger) thread = 'logger'
    if (config.loglevel > 5) return this
    fs.appendFileSync('latest.log', `[${thread}/FATAL] ${message}\n`)
    if (config.consoleloglevel > 5) return this
    console.error(`[${thread}/FATAL] ${message}`)
    return this
  }
  trace(message, isLogger = false) {
    let thread = this.thread
    if (isLogger) thread = 'logger'
    if (config.loglevel > 0) return this
    fs.appendFileSync('latest.log', `[${thread}/TRACE] ${message}\n`)
    if (config.consoleloglevel > 0) return this
    console.trace(`[${thread}/TRACE] ${message}`)
    return this
  }
}

module.exports = new Logger()
