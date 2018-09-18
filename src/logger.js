const fs = require('fs')
const config = require('./config.yml')
const chalk = require('chalk')
const share = require('./share')

class Logger {
  /**
   * Do not call this method twice.
   *
   * @returns {Logger} A Logger instance
   */
  initLog() {
    this.initialized = true
    fs.writeFileSync('latest.log', `--- The log begin at ${new Date().toLocaleString()} ---\n`)
    if (config.logger.style === 'maven') {
      this.style = 'maven'
    } else if (config.logger.style === 'npm') {
      this.style = 'npm'
    } else {
      this.style = 'original'
    }
    this.info('The log file has initialized.', true)
    return this
  }

  /**
   * Set thread name and color.
   *
   * @example const logger = require('./logger').getLogger("example", "red")
   * @param {string} thread Thread name
   * @param {string} color yellow, darkgray, red, lightred, green, lightpurple, white, cyan, purple, blue
   * @returns {Logger} A Logger instance
   */
  getLogger(thread, color = 'yellow', init = true) {
    if (!init) this.initLog = () => {}
    if (!this.initialized && init) this.initLog()
    const self = new Logger()
    self.thread = thread
    self.thread_raw = thread
    if (config.logger.style === 'maven') {
      self.style = 'maven'
    } else if (config.logger.style === 'npm') {
      self.style = 'npm'
    } else {
      self.style = 'original'
    }
    switch (color) {
      case 'yellow': self.thread = chalk.bold.yellow(thread); break
      case 'darkgray': self.thread = chalk.gray(thread); break
      case 'red': self.thread = chalk.red(thread); break
      case 'lightred': self.thread = chalk.bold.red(thread); break
      case 'green': self.thread = chalk.green(thread); break
      case 'lightpurple': self.thread = chalk.bold.hex('#800080')(thread); break
      case 'white': self.thread = chalk.white(thread); break
      case 'cyan': self.thread = chalk.cyan(thread); break
      case 'purple': self.thread = chalk.hex('#800080')(thread); break
      case 'blue': self.thread = chalk.blue(thread); break
    }
    this.info(`Registered logger for: ${thread}`, true)
    return self
  }
  /**
   *
   * @param {*} message Message of this log
   * @param {string} level error, warn, fatal, info, debug
   * @param {string} color color of chalk
   * @param {boolean} isLogger Is this called by myself?
   * @returns {void} <void>
   * @private
   */
  out(message, level, color, isLogger) {
    share.thread = this.thread
    const originaldate = new Date()
    const date = chalk.cyan(`${originaldate.getFullYear()}-${originaldate.getMonth()}-${originaldate.getDate()} ${originaldate.getHours()}:${originaldate.getMinutes()}:${originaldate.getSeconds()}.${originaldate.getMilliseconds()}`) + chalk.reset()
    let thread = this.thread
    const logger = {}
    logger.coloredlevel = chalk`{${color} ${level}}`
    if (isLogger) { this.thread_raw = 'logger'; thread = chalk.hex('#800080')(this.thread_raw) }
    let data
    if (this.style === 'maven') {
      level = level.replace('warn', 'warning')
      logger.coloredlevel2 = chalk`{${color}.bold ${level.toUpperCase()}}`
      data = `[${logger.coloredlevel2}${chalk.reset()}] ${message}${chalk.reset()}`
    } else if (this.style === 'npm') {
      level = level.replace('error', 'ERR!')
      level = level.replace('warn', 'WARN')
      logger.coloredlevel2 = level === 'WARN' ? chalk.bgYellow(level) : level === 'info' ? chalk.green(level) : chalk[color](level)
      data = `${chalk.white('BlackListener')} ${logger.coloredlevel2}${chalk.reset()} ${chalk.hex('#800080')(this.thread_raw)}${chalk.reset()} ${chalk.green(message)}${chalk.reset()}`
    } else {
      data = `${date} ${thread}${chalk.reset()} ${logger.coloredlevel}${chalk.reset()} ${chalk.green(message)}${chalk.reset()}`
    }
    fs.appendFileSync('latest.log', `${data}\n`)
    console.info(data)
  }
  /**
   * Outputs info level message.
   *
   * @example logger.info("foo")
   *
   *
   * @example logger.info("foo").error("bar")
   *
   *
   * @param {*} message
   * @param {boolean} isLogger Don't use this
   *
   * @returns {Logger} A Logger instance
   */
  info(message, isLogger = false) {
    this.out(message, 'info', 'blue', isLogger)
    return this
  }
  /**
   * Outputs debug level message.
   * Just debug message.
   * 
   * @example logger.debug("foo")
   *
   *
   * @example logger.debug("foo").error("bar")
   *
   *
   * @param {*} message
   * @param {boolean} isLogger Don't use this
   *
   * @returns {Logger} A Logger instance
   */
  debug(message, isLogger = false) {
    if (config.logger.debug) {
      this.out(message, 'debug', 'cyan', isLogger)
    }
    return this
  }
  /**
   * Outputs warn level message.
   * Warning condition
   *
   * @example logger.warn("foo")
   *
   *
   * @example logger.warn("foo").error("bar")
   *
   *
   * @param {*} message
   * @param {boolean} isLogger Don't use this
   *
   * @returns {Logger} A Logger instance
   */
  warn(message, isLogger = false) {
    this.out(message, 'warn', 'bold.yellow', isLogger)
    return this
  }
  /**
   * Outputs error level message.
   * Error condition
   *
   * @example logger.error("foo")
   *
   *
   * @example logger.error("foo").debug("bar")
   *
   *
   * @param {*} message
   * @param {boolean} isLogger Don't use this
   *
   * @returns {Logger} A Logger instance
   */
  error(message, isLogger = false) {
    this.out(message, 'error', 'red', isLogger)
    return this
  }
  /**
   * Outputs fatal level message.
   * Fatal Error, may need action immediately
   *
   * @example logger.fatal("foo")
   *
   *
   * @example logger.fatal("foo").error("bar")
   *
   *
   * @param {*} message
   * @param {boolean} isLogger Don't use this
   *
   * @returns {Logger} A Logger instance
   */
  fatal(message, isLogger = false) {
    this.out(message, 'fatal', 'redBright.bold', isLogger)
    return this
  }
  /**
   * Outputs emerg level message.
   * Use on going system is unusable(e.g. uncaughtException)
   *
   * @example logger.emerg("foo")
   *
   *
   * @example logger.emerg("foo").emerg("bar")
   *
   *
   * @param {*} message
   *
   * @returns {Logger} A Logger instance
   */
  emerg(message) {
    this.out(message, 'emerg', 'red.bold', false)
    return this
  }
}

process.on('message', message => {
  if (message === 'noinit') Logger.prototype.initLog = () => {}
})

module.exports = new Logger()
