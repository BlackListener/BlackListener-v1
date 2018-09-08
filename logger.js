const fs = require('fs')
const config = require('./config.yml')
const chalk = require('chalk')

class Logger {
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
  getLogger(thread, color = 'yellow') {
    if (!this.initialized) this.initLog()
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
  out(message, level, color, isLogger) {
    global.thread = this.thread
    const originaldate = new Date()
    const date = chalk.cyan(`${originaldate.getFullYear()}-${originaldate.getMonth()}-${originaldate.getDate()} ${originaldate.getHours()}:${originaldate.getMinutes()}:${originaldate.getSeconds()}.${originaldate.getMilliseconds()}`) + chalk.reset()
    let thread = this.thread
    global.logger = {}
    global.logger.coloredlevel = chalk[color](level)
    if (isLogger) { this.thread_raw = 'logger'; thread = chalk.hex('#800080')(this.thread_raw) }
    let data
    if (this.style === 'maven') {
      level = level.replace('warn', 'warning')
      global.logger.coloredlevel2 = chalk[color].bold(level.toUpperCase())
      data = `[${global.logger.coloredlevel2}${chalk.reset()}] ${message}${chalk.reset()}`
    } else if (this.style === 'npm') {
      level = level.replace('error', 'ERR!')
      level = level.replace('warn', 'WARN')
      global.logger.coloredlevel2 = level === 'WARN' ? chalk.bgYellow(level) : level === 'info' ? chalk.green(level) : chalk[color](level)
      data = `${chalk.white('BlackListener')} ${global.logger.coloredlevel2}${chalk.reset()} ${chalk.hex('#800080')(this.thread_raw)}${chalk.reset()} ${chalk.green(message)}${chalk.reset()}`
    } else {
      data = `${date} ${thread}${chalk.reset()} ${global.logger.coloredlevel}${chalk.reset()} ${chalk.green(message)}${chalk.reset()}`
    }
    fs.appendFileSync('latest.log', `${data}\n`)
    console.info(data)
  }
  info(message, isLogger = false) {
    this.out(message, 'info', 'blue', isLogger)
    return this
  }
  debug(message, isLogger = false) {
    if (config.logger.debug) {
      this.out(message, 'debug', 'cyan', isLogger)
    }
    return this
  }
  warn(message, isLogger = false) {
    this.out(message, 'warn', 'bold.yellow', isLogger)
    return this
  }
  error(message, isLogger = false) {
    this.out(message, 'error', 'red', isLogger)
    return this
  }
  fatal(message, isLogger = false) {
    this.out(message, 'fatal', 'redBright.bold', isLogger)
    return this
  }
}

module.exports = new Logger()
