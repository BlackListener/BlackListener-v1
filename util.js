const _fs = require('fs')
const fs = _fs.promises
const logger = require('./logger').getLogger('util')
const Discord = require('discord.js')
const f = require('string-format')
let once = false; let lang

module.exports = {
  configure(lang) {
    this.lang = lang
    return this
  },
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async initJSON(path, json) {
    if (await this.exists(path)) return
    logger.info(`Creating ${path}`)
    return await this.writeJSON(path, json)
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
  cmdcheck() {
    const cmd = arguments[0]
    for (let i=0; i<arguments.length;++i) {
      if (i !== 0) if (cmd === arguments[i]) return true
    }
    return false
  },
  async writeSettings(settingsFile, wsettings, channel, config) {
    await this.writeJSON(settingsFile, wsettings)
    if (channel) await channel.send(f(lang.setconfig, config))
  },
  addRole(msg, rolename, isCommand = true, guildmember = null) {
    let role = null
    let member = null
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
      if (!guildmember) {
        member = msg.guild.members.get(msg.author.id)
      } else {
        member = msg.guild.members.get(guildmember.id)
      }
      if (isCommand) {
        if (member.roles.has(role.id)) {
          member.removeRole(role).catch(logger.error)
          const embed = new Discord.RichEmbed().setTitle(':wastebasket: ロールから削除').setColor([255,0,0]).setDescription('ロール ``' + rolename + '`` から削除しました。')
          msg.channel.send(embed)
        } else {
          member.addRole(role).catch(logger.error)
          const embed = new Discord.RichEmbed().setTitle(':heavy_plus_sign: ロールへ追加').setColor([0,255,0]).setDescription('ロール ``' + rolename + '`` へ追加しました。')
          msg.channel.send(embed)
        }
      } else {
        member.addRole(role).catch(logger.error)
      }
    } catch (e) {
      msg.channel.send(lang.role_error)
      logger.error(e)
    }
  },
  async checkConfig(user, settings, userFile, guildSettings) {
    try {
      once = true
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
      if (!once) {
        logger.error(`Something went wrong, retrying: ${e}`)
          .error(e)
      } else {
        logger.error(`Something went wrong, giving up: ${e}`)
          .error(e)
      }
    }
  },
}
