class Command {
  /**
   * Construct this Command Instance.
   *
   * If not extend this Class, it will be marked 'not a command'
   * @param {string} name Command name
   * @param {JSON} options alias, args
   * @constructor
   */
  constructor(name, options = {}) {
    this.name = name
    //Object.keys(options).forEach(key => this[key] = options[key] || null) // Are you sure want this?
    this.alias = options.alias || null
    this.args = options.args || null
  }

  /**
   * @abstract
   */
  run() {}

  /**
   * @abstract
   */
  isAllowed() { return true }
}

module.exports = {
  Command,
}
