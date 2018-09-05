const _fs = require('fs')
const fs = _fs.promises
const logger = require('./logger').getLogger('util')
const Discord = require('discord.js')
const YAML = require('yaml').default

module.exports = {
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async initJSON(path, json) {
    if (await this.exists(path)) return
    logger.info(`Creating ${path}`)
    return await this.writeJSON(path, json)
  },
  async initYAML(path, json) {
    if (await this.exists(path)) return
    logger.info(`Creating ${path}`)
    return await this.writeYAML(path, json)
  },
  async readYAML(path, _default) {
    logger.debug(`Reading from file: ${path}`)
    return await fs.readFile(path, 'utf8')
      .then(data => this.parseYAML(data))
      .catch(err => _default ? null : err)
  },
  async readJSON(path, _default) {
    logger.debug(`Reading from file: ${path}`)
    return await fs.readFile(path, 'utf8')
      .then(data => this.parse(data))
      .catch(err => _default ? null : err)
  },
  async writeJSON(path, json) {
    logger.debug(`Writing file: ${path}`)
    const data = this.stringify(json)
    return fs.writeFile(path, data, 'utf8')
  },
  async writeYAML(path, yaml) {
    logger.debug(`Writing file: ${path}`)
    const data = this.stringifyYAML(yaml)
    return fs.writeFile(path, data, 'utf8')
  },
  readJSONSync(path) {
    const data = _fs.readFileSync(path, 'utf8')
    return this.parse(data)
  },
  readYAMLSync(path) {
    const data = _fs.readFileSync(path, 'utf8')
    return this.parseYAML(data)
  },
  writeJSONSync(path, json) {
    const data = this.stringify(json)
    _fs.writeFileSync(path, data, 'utf8')
  },
  writeYAMLSync(path, yaml) {
    const data = this.stringifyYAML(yaml)
    _fs.writeFileSync(path, data, 'utf8')
  },
  parse(json) {
    return JSON.parse(json)
  },
  parseYAML(yaml) {
    return YAML.parse(yaml)
  },
  stringify(json) {
    return JSON.stringify(json, null, 4)
  },
  stringifyYAML(yaml) {
    return YAML.stringify(yaml)
  },
  addRole(msg, rolename, isCommand = true, guildmember = null, language) {
    const lang = require(`./lang/${language}.json`)
    let role; let member
    try {
      try {
        role = msg.guild.roles.find('name', rolename)
      } catch (e) {
        try {
          role = msg.guild.roles.get(rolename)
        } catch (e) {
          logger.error('An error occurred in \'addRole\': ' + e)
        }
      }
      if (!guildmember) { member = msg.guild.members.get(msg.author.id) } else { member = msg.guild.members.get(guildmember.id) }
      if (isCommand) {
        const build = function(title, message) {
          const embed = new Discord.RichEmbed().setTitle(title).setColor([255,0,0]).setDescription('役職 ``' + rolename + '`` ' + message)
          msg.channel.send(embed)
        }
        if (member.roles.has(role.id)) {
          member.removeRole(role).catch(logger.error)
          build(':wastebasket: 役職を剥奪しました', ' から削除しました。')
        } else {
          member.addRole(role).catch(logger.error)
          build(':heavy_plus_sign: 役職を付与しました', ' を付与しました')
        }
      } else { member.addRole(role).catch(logger.error) }
    } catch (e) {
      msg.channel.send(lang.role_error); logger.error(e)
    }

  },
}
