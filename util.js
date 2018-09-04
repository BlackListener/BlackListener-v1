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
  async checkConfig(user, settings, userFile, guildSettings) {
    try {
      let userChanged = false; let serverChanged = false
      if (!user.bannedFromServer) {
        user.bannedFromServer = []
        userChanged = true
      }
      if (!user.bannedFromServerOwner) {
        user.bannedFromServerOwner = []
        userChanged = true
      }
      if (!user.bannedFromUser) {
        user.bannedFromUser = []
        userChanged = true
      }
      if (!user.probes) {
        user.probes = []
        userChanged = true
      }
      if (!user.reasons) {
        user.reasons = []
        userChanged = true
      }
      if (!user.tag_changes) {
        user.tag_changes = []
        userChanged = true
      }
      if (!user.avatar_changes) {
        user.avatar_changes = []
        userChanged = true
      }
      if (!user.username_changes) {
        user.username_changes =[]
        userChanged = true
      }
      if (!settings.banned) {
        settings.banned = false
        serverChanged = true
      }
      if (!settings.excludeLogging) {
        settings.excludeLogging = ''
        serverChanged = true
      }
      if (!settings.welcome_channel) {
        settings.welcome_channel = null
        serverChanged = true
      }
      if (!settings.welcome_message) {
        settings.welcome_message = null
        serverChanged = true
      }
      if (!settings.mute) {
        settings.mute = []
        serverChanged = true
      }
      if (!settings.message_blacklist) {
        settings.message_blacklist = []
        serverChanged = true
      }
      if (!settings.blocked_role) {
        settings.blocked_role = []
        serverChanged = true
      }
      if (!settings.log_channel) {
        settings.log_channel = ''
        serverChanged = true
      }
      if (userChanged) await fs.writeFile(userFile, JSON.stringify(user, null, 4), 'utf8')
      if (serverChanged) await fs.writeFile(guildSettings, JSON.stringify(settings, null, 4), 'utf8')
    } catch (e) {
      logger.error(`Something went wrong: ${e}`)
        .error(e)
    }
  },
  async checkConfigYAML(user, settings, userFile, guildSettings) {
    try {
      let userChanged = false; let serverChanged = false
      if (!user.bannedFromServer) {
        user.bannedFromServer = []
        userChanged = true
      }
      if (!user.bannedFromServerOwner) {
        user.bannedFromServerOwner = []
        userChanged = true
      }
      if (!user.bannedFromUser) {
        user.bannedFromUser = []
        userChanged = true
      }
      if (!user.probes) {
        user.probes = []
        userChanged = true
      }
      if (!user.reasons) {
        user.reasons = []
        userChanged = true
      }
      if (!user.tag_changes) {
        user.tag_changes = []
        userChanged = true
      }
      if (!user.avatar_changes) {
        user.avatar_changes = []
        userChanged = true
      }
      if (!user.username_changes) {
        user.username_changes =[]
        userChanged = true
      }
      if (!settings.banned) {
        settings.banned = false
        serverChanged = true
      }
      if (!settings.excludeLogging) {
        settings.excludeLogging = ''
        serverChanged = true
      }
      if (!settings.welcome_channel) {
        settings.welcome_channel = null
        serverChanged = true
      }
      if (!settings.welcome_message) {
        settings.welcome_message = null
        serverChanged = true
      }
      if (!settings.mute) {
        settings.mute = []
        serverChanged = true
      }
      if (!settings.message_blacklist) {
        settings.message_blacklist = []
        serverChanged = true
      }
      if (!settings.blocked_role) {
        settings.blocked_role = []
        serverChanged = true
      }
      if (!settings.log_channel) {
        settings.log_channel = ''
        serverChanged = true
      }
      if (userChanged) await fs.writeFile(userFile, YAML.stringify(user), 'utf8')
      if (serverChanged) await fs.writeFile(guildSettings, YAML.stringify(settings), 'utf8')
    } catch (e) {
      logger.error(`Something went wrong: ${e}`)
        .error(e)
    }
  },
}
