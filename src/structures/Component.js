const logger = require('./util/LoggerFactory').getLogger('Component', 'green')
const Discord = require('discord.js')
const { commands } = require('../../config')
const c = process.argv.includes('--travis-build') ? require(__dirname + '/../travis.yml') : require(__dirname + '/../config.yml')

/**
 * Represents Component.
 *
 * For Command, please use Command class.
 */
class Component {
  /**
   * Component options
   * @typedef ComponentOptions
   * @property {boolean} required_args
   * @property {number} permission
   * @property {boolean} enabled
   * @property {boolean} registercmd if true, component will try to register as command
   */

  /**
   * @param {string} name Command name
   * @param {ComponentOptions} options options
   * @constructor
   */
  constructor(name, options = {}) {
    this.name = name
    
    options = Object.assign({
      required_args: true,
      args: ['<empty>'],
      permission: 0,
      enabled: true,
      registercmd: false,
    }, options)

    this.required_args = options.required_args
    this.enabled = options.enabled
    this.permission = new Discord.Permissions(options.permission).freeze()
    this.args = options.args // define but never used in this class
    this.registercmd = options.registercmd
    if (this.registercmd) {
      logger.info('Registering command: ' + this.name)
      this.register(this.name, this)
    }
  }

  /**
   * @abstract
   * @param {Discord.Message} msg
   */
  isAllowed({ member }) {
    return member.hasPermission(this.permission.bitfield)
  }

  /**
   * @abstract
   */
  async _run() {}

  /**
   * Do not override this method.
   * @param {Discord.Message} msg
   * @param {Object} settings Settings object
   * @param {Object} lang Languages object
   * @param {Array<String>} args
   * @throws TypeError if not defined msg, settings, lang, (args if required_args is true)
   * @returns {Promise<any>}
   */
  async run(msg, settings, lang, args) {
    if (!msg || !settings || !lang || (this.required_args && !args)) throw new TypeError(`Required msg, settings, lang${this.required_args ? '' : ', args'} but not defined.`)
    if (!this.enabled) return msg.channel.send(`\`${this.name}\` component is not enabled.`)
    if (!this.isAllowed(msg, c.owners)) return msg.channel.send(lang.udonthaveperm)
    return await this._run(msg, settings, lang, args)
  }

  register(name, clazz) {
    commands[name] = clazz
  }
}

module.exports = Component
