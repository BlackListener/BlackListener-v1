const Discord = require('discord.js') // eslint-disable-line

class Command {
  /**
   * Construct this Command Instance.
   *
   * If not extend this Class, it will be marked 'not a command'
   * @param {string} name Command name
   * @param {JSON} options alias, args, permission(number)
   * @constructor
   */
  constructor(name, options = {}) {
    this.name = name
    //Object.keys(options).forEach(key => this[key] = options[key] || null) // Are you sure want this?
    this.alias = options.alias || null
    this.args = options.args || null
    this.permission = options.permission || null
  }

  /**
   * @abstract
   */
  run() {}

  /**
   * @abstract
   * @param {Discord.Message} msg
   */
  isAllowed(msg) {
    if (!this.permission) return true
    try {
      return msg.member.hasPermission(parseInt(this.permission))
    } catch(e) {
      throw TypeError('Permission must be a number.')
    }
  }
}

module.exports = {
  Command,
}
