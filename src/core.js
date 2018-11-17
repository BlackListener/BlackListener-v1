const Discord = require('discord.js')
const { Permissions } = Discord

class Command {
  /**
   * Command options
   * @typedef CommandOptions
   * @property {Array<string>} alias
   * @property {Array<string>} args
   * @property {number} permission
   * @property {boolean} enabled
   */

  /**
   * Construct this Command Instance.
   *
   * If not extend this Class, it will be marked 'not a command'
   * @param {string} name Command name
   * @param {CommandOptions} options options
   * @constructor
   */
  constructor(name, options = { alias: [], args: [], permission: 0, enabled: true }) {
    this.name = name
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
