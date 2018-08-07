module.exports = {
  log(message) {
    return this.info(message);
  },
  info(message) {
    return console.info(`[INFO] ${message}`);
  },
  warn(message) {
    return console.warn(`[WARN] ${message}`);
  },
  error(message) {
    return console.error(`[ERROR] ${message}`);
  },
  debug(message) {
    return console.debug(`[DEBUG] ${message}`);
  },
  fatal(message) {
    return console.error(`[FATAL] ${message}`);
  }
}
