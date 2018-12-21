require('../../yaml')
const fs = require('fs')
const config = require('../../config.yml')
const chalk = require('chalk')
const moment = require('moment')
const args = require('../../argument_parser')(process.argv.slice(2))

class Logger {
  constructor(init) {
    this.initLog(init)
  }

  /**
   * Do not call this method twice.
   *
   * @returns {Logger} A Logger instance
   */
  initLog(init) {
    if (init) return this
    fs.writeFileSync('latest.log', `--- The log begin at ${new Date().toLocaleString()} ---\n`)
    return this.info('The log file has initialized.', true)
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
  out(message, level, color, isLogger, write_to_console = true) {
    const date = chalk.cyan(moment().format('YYYY-MM-DD HH:mm:ss.SSS')) + chalk.reset()
    let thread = this.thread
    const logger = {}
    logger.coloredlevel = chalk`{${color} ${level}}`
    if (isLogger) { this.thread_raw = 'logger'; thread = chalk.hex('#800080')(this.thread_raw) }
    const data = `${date} ${thread}${chalk.reset()} ${logger.coloredlevel}${chalk.reset()} ${chalk.green(message)}${chalk.reset()}`
    fs.appendFileSync('latest.log', `${data}\n`)
    if (write_to_console) console.info(data)
    return this
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
    return this.out(message, 'info', 'blue', isLogger)
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
    let opt = false
    if (config.logger.debug || args.debugg) {
      if (args.debugg === false) return this
      opt = true
    }
    return this.out(message, 'debug', 'cyan', isLogger, opt)
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
    return this.out(message, 'warn', 'bold.yellow', isLogger)
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
    return this.out(message, 'error', 'red', isLogger)
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
    return this.out(message, 'fatal', 'redBright.bold', isLogger)
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
    return this.out(message, 'emerg', 'red.bold', false)
  }
}

module.exports = Logger
