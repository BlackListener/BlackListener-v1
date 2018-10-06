const Discord = require('discord.js')
const { Permissions } = Discord
const { commandsDefaults: defaults } = require('./contents')

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

    options = Object.assign(defaults, options)

    this.enabled = options.enabled
    this.alias = options.alias
    this.args = options.args
    this.permission = new Permissions(options.permission).freeze()
  }

  /**
   * @abstract
   */
  run() {}

  /**
   * @abstract
   * @param {Discord.Message} msg
   */
  isAllowed({ member }) {
    return member.hasPermission(this.permission)
  }
}

module.exports = {
  Command,
}
