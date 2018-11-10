const Discord = require('discord.js')
const { Permissions } = Discord

class Command {
  /**
   * Construct this Command Instance.
   *
   * If not extend this Class, it will be marked 'not a command'
   * @param {string} name Command name
   * @param {Object} options alias, args, permission(number)
   * @constructor
   */
  constructor(name, options = {}) {
    this.name = name

    options = Object.assign({
      alias: [],
      args: [],
      permission: 0,
      enabled: true,
    }, options)

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
    return member.hasPermission(this.permission.bitfield)
  }

  /**
   * @async
   * @returns {any}
   * @param {string} e 
   */
  async _eval(e) {
    return await (eval(`(async () => {${e}})()`))
  }
}

module.exports = {
  Command,
}
