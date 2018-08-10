const fs = require('fs');

module.exports = {
  init() {
    fs.writeFileSync("latest.log", `--- The log begin at ${new Date().toLocaleString()} ---\n`)
    console.log("[INFO] The log file has initialized.")
    return this;
  },
  log(message) {
    return this.info(message)
  },
  info(message) {
    fs.appendFileSync("latest.log", `[INFO] ${message}\n`)
    return console.info(`[INFO] ${message}`)
  },
  warn(message) {
    fs.appendFileSync("latest.log", `[WARN] ${message}\n`)
    return console.warn(`[WARN] ${message}`)
  },
  error(message) {
    fs.appendFileSync("latest.log", `[ERROR] ${message}\n`)
    return console.error(`[ERROR] ${message}`)
  },
  debug(message) {
    fs.appendFileSync("latest.log", `[DEBUG] ${message}\n`)
    return console.debug(`[DEBUG] ${message}`)
  },
  fatal(message) {
    fs.appendFileSync("latest.log", `[FATAL] ${message}\n`)
    return console.error(`[FATAL] ${message}`)
  },
}
