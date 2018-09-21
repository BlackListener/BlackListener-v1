const _fs = require('fs')
const fs = _fs.promises
const logger = require('./logger').getLogger('util')
const Discord = require('discord.js')

module.exports = {
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async readJSON(path, _default) {
    logger.debug(`Reading from file: ${path}`)
    return await fs.readFile(path, 'utf8')
      .then(data => this.parse(data))
      .catch(err => _default || err)
  },
  async writeJSON(path, json) {
    logger.debug(`Writing file: ${path}`)
    const data = this.stringify(json)
    return fs.writeFile(path, data, 'utf8')
  },
  readJSONSync(path) {
    const data = _fs.readFileSync(path, 'utf8')
    return this.parse(data)
  },
  writeJSONSync(path, json) {
    const data = this.stringify(json)
    _fs.writeFileSync(path, data, 'utf8')
  },
  parse(json) {
    return JSON.parse(json)
  },
  stringify(json) {
    return JSON.stringify(json, null, 4)
  },
  addRole(msg, rolename, isCommand = true, guildmember = null, language) {
    const lang = require(`./lang/${language}.json`)
    let role; let member
    try {
      try {
        role = msg.guild.roles.find(n => n.name === rolename) || msg.guild.roles.get(rolename)
      } catch(e) { logger.error('An error occurred in \'addRole\': ' + e) }
      if (!guildmember) { member = msg.guild.members.get(msg.author.id) } else { member = msg.guild.members.get(guildmember.id) }
      if (isCommand) {
        const build = function(title, message) {
          const embed = new Discord.RichEmbed().setTitle(title).setColor([255,0,0]).setDescription('Role ``' + rolename + '`` ' + message)
          msg.channel.send(embed)
        }
        if (member.roles.has(role.id)) {
          member.removeRole(role).catch(e => logger.error(e))
          build('<:tickNo:315009174163685377> Removed role from user', ' removed from user')
        } else {
          member.addRole(role).catch(e => logger.error(e))
          build('<:tickYes:315009125694177281> Added role to user', ' added to user')
        }
      } else { member.addRole(role).catch(e => logger.error(e)) }
    } catch (e) {
      msg.channel.send(lang.role_error); logger.error(e)
    }
  },
}
