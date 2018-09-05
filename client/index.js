const share = require('../share')
const root = share.rootDir
require(root + '/yaml') // Assign extension .yml for YAML
const logger = require(root + '/logger').getLogger('main', 'green')
logger.info('Initializing')
const f = require('string-format')
const Discord = require('discord.js')
const client = new Discord.Client()
const mkdirp = require('mkdirp-promise')
const DBL = require('dblapi.js')
const fs = require('fs').promises
const util = require(root + '/util')
const isTravisBuild = process.argv[2] === '--travis-build'
const c = require(root + '/config.yml')
const ds = require(root + '/config/DataStore')
ds.initialized = true
const cs = require(root + '/config/ConfigStore')
share.client = client

if (process.env.ENABLE_RCON) {
  logger.warn('Remote control is enabled.')
    .warn('Be careful for unexpected shutdown! (Use firewall to refuse from attack)')
    .info('Listener will be startup with 5123 port.')
  require('./ShutdownPacketListener')(client)
} else {
  logger.info('Remote control is disabled.')
    .info('If you wish to enable remote control, please set some string in \'ENABLE_RCON\'. (Not recommended for security reasons)')
}

if (process.env.BL_PREFIX) {
  logger.info('BL_PREFIX is present.')
  c.prefix = process.env.BL_PREFIX
}
logger.info(`Default prefix: ${c.prefix}`)

let s
try {
  s = isTravisBuild ? require(root + '/travis.yml') : require(root + '/secret.yml')
} catch (e) {
  logger.fatal('Not found \'secret.yml\' and not specified option \'--travis-build\' or specified option \'--travis-build\' but not found \'travis.yml\'')
  process.exit(1)
}
const {
  defaultSettings,
  defaultBans,
  defaultUser,
} = require(root + '/contents')
const dispatcher = require(root + '/dispatcher')

require(root + '/register')(client)

let lang

if (!isTravisBuild && s.dbl) new DBL(s.dbl, client)

client.on('ready', async () => {
  await mkdirp(root + '/error-reports')
  await mkdirp(root + '/crash-reports')
  await mkdirp(root + '/data/servers')
  await mkdirp(root + '/data/users')
  await mkdirp(root + '/plugins/commands')
  util.initJSON(root + '/data/bans.json', defaultBans).catch(logger.error)
  client.user.setActivity(`${c.prefix}help | Hello @everyone!`)
  client.setTimeout(() => {
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  }, 10000)
  logger.info(`BlackListener v${c.version} (build: ${c.build}) has fully startup.`)
  if (isTravisBuild) {
    logger.info('Shutting down...')
    await client.destroy()
    process.exit()
  }
})

client.on('message', async msg => {
  if (!msg.guild && msg.author.id !== client.user.id) msg.channel.send('Currently not supported DM')
  if (!msg.guild) return
  const guildSettings = `${root}/data/servers/${msg.guild.id}/config.json`
  await mkdirp(`${root}/data/users/${msg.author.id}`)
  await mkdirp(`${root}/data/servers/${msg.guild.id}`)
  const userMessagesFile = `${root}/data/users/${msg.author.id}/messages.log`
  const serverMessagesFile = `${root}/data/servers/${msg.guild.id}/messages.log`
  const userFile = `${root}/data/users/${msg.author.id}/config.json`
  const parentName = msg.channel.parent ? msg.channel.parent.name : ''
  try {
    await util.initJSON(userFile, defaultUser)
    await util.initJSON(guildSettings, defaultSettings)
  } catch (e) {
    try {
      await util.initJSON(userFile, defaultUser)
      await util.initJSON(guildSettings, defaultSettings)
    } catch (e) {logger.error(e)}
  }
  const user = await cs.use(userFile, Object.assign(defaultUser, await util.readJSON(userFile)))
  const settings = await cs.use(guildSettings, Object.assign(defaultSettings, await util.readJSON(guildSettings)))
  logger.debug('Loading ' + guildSettings)
  await util.checkConfig(user, settings, userFile, guildSettings)
  try {
    if (msg.channel.id !== settings.excludeLogging) {
      const log_message = `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}`
      fs.appendFile(userMessagesFile, log_message)
      fs.appendFile(serverMessagesFile, log_message)
    }
  } catch (e) {
    logger.error(`Error while logging message (${guildSettings}) (${e})`)
  }
  // --- Begin of Sync
  if (msg.content === settings.prefix + 'sync') return
  if (msg.guild.members.get(c.extender_id) && msg.author.id === c.extender_id) {
    if (msg.content === `plz sync <@${client.user.id}>`) {
      const message = await msg.channel.send(`hey <@${c.extender_id}>, ` + settings.language)
      message.delete(500)
    }
  }
  // --- End of Sync

  // --- Begin of Mute
  if (settings.mute.includes(msg.author.id) && !settings.banned) {
    msg.delete(0)
  }
  // --- End of Mute
  if (!msg.author.bot) {
    lang = await util.readJSON(`${root}/lang/${settings.language}.json`)
    if (msg.system || msg.author.bot) return
    // --- Begin of Auto-ban
    if (!settings.banned) {
      if (settings.banRep <= user.rep && settings.banRep != 0) {
        msg.guild.ban(msg.author)
          .then(() => logger.info(f(lang.autobanned, msg.author.tag, user.id, msg.guild.name, msg.guild.id)))
          .catch(logger.error)
      }
    }
    // --- End of Auto-ban

    // --- Begin of Anti-spam
    try {
      if (settings.antispam && !settings.ignoredChannels.includes(msg.channel.id) && !msg.author.bot) {
        if (/(\S)\1{15,}/gm.test(msg.content)) {
          if (settings.banned) return
          msg.delete(0)
          msg.channel.send(lang.includes_spam)
        }
      }
    } catch (e) {
      logger.error(`Error while processing anti-spam. (${guildSettings})`)
    }
    // --- End of Anti-spam
    dispatcher(settings, msg, lang, guildSettings)
  }
})

client.on('guildMemberAdd', async (member) => {
  const userFile = `${root}/data/users/${member.user.id}/config.json`
  const serverFile = `${root}/data/servers/${member.guild.id}/config.json`
  await mkdirp(`${root}/data/users/${member.user.id}`)
  await mkdirp(`${root}/data/servers/${member.guild.id}`)
  try {
    await util.initJSON(userFile, defaultUser)
    await util.initJSON(serverFile, defaultSettings)
  } catch (e) {
    try {
      await util.initJSON(userFile, defaultUser)
      await util.initJSON(serverFile, defaultSettings)
    } catch (e) {logger.error(e)}
  }
  const serverSetting = await util.readJSON(serverFile)
  const userSetting = await util.readJSON(userFile)
  if (!serverSetting.banned) {
    if (serverSetting.banRep <= userSetting.rep && serverSetting.banRep != 0) {
      member.guild.ban(member)
        .then(() => logger.info(f(lang.autobanned, member.user.tag, member.id, member.guild.name, member.guild.id)))
        .catch(logger.error)
    } else if (serverSetting.notifyRep <= userSetting.rep && serverSetting.notifyRep != 0) {
      member.guild.owner.send(`${member.user.tag}は評価値が${serverSetting.notifyRep}以上です(ユーザーの評価値: ${userSetting.rep})`)
    }
  }
  if (serverSetting.autorole) {
    (async function () {
      const role = await member.guild.roles.get(serverSetting.autorole)
      member.addRole(role)
      logger.info(`Role(${role.name}) granted for: ${member.tag} in ${member.guild.name}(${member.guild.id})`)
    }) ()
  }
  if (!!serverSetting.welcome_channel && !!serverSetting.welcome_message) {
    let message = serverSetting.welcome_message.replace('{user}', `<@${member.user.id}>`)
    message = message.replace(/{rep}/gm, `${userSetting.rep}`)
    message = message.replace(/{id}/gm, `${member.user.id}`)
    message = message.replace(/{username}/gm, `${member.user.username}`)
    message = message.replace(/{tag}/gm, `${member.user.tag}`)
    message = message.replace(/{users}/gm, `${member.guild.members.size}`)
    message = message.replace(/{createdAt}/gm, `${member.createdAt.toLocaleTimeString()}`)
    message = message.replace(/{joinedAt}/gm, `${member.joinedAt.toLocaleTimeString()}`)
    message = message.replace(/{avatarURL}/gm, `${member.user.avatarURL}`)
    member.guild.channels.get(serverSetting.welcome_channel).send(message)
  }
})

client.on('messageUpdate', async (old, msg) => {
  const settings = await util.readJSON(`./data/servers/${msg.guild.id}/config.json`, defaultSettings)
  if (old.content === msg.content) return
  if (msg.channel.id !== settings.excludeLogging) {
    let parentName
    if (msg.channel.parent) {
      parentName = msg.channel.parent.name
    } else {
      parentName = ''
    }
    await mkdirp(`${root}/data/users/${msg.author.id}`)
    await mkdirp(`${root}/data/servers/${msg.guild.id}`)
    const editUserMessagesFile = `${root}/data/users/${msg.author.id}/editedMessages.log`
    const editServerMessagesFile = `${root}/data/servers/${msg.guild.id}/editedMessages.log`
    fs.appendFile(editUserMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`)
    fs.appendFile(editServerMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`)
  }
})

function getDateTime()
{
  const date = new Date()
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].join( '/' ) + ' ' + date.toLocaleTimeString()
}

client.on('userUpdate', async (olduser, newuser) => {
  const userFile = `${root}/data/users/${olduser.id}/config.json`
  const user = await util.readJSON(userFile, defaultUser)
  let userChanged = false
  try {
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
  } catch (e) {
    logger.error(`Error while null checking (${e})`)
  }
  try {
    if (userChanged) await fs.writeFile(userFile, JSON.stringify(user, null, 4), 'utf8')
    if (olduser.username !== newuser.username) user.username_changes.push(`${olduser.username} -> ${newuser.username}`)
  } catch (e) {
    logger.error(e.stack)
  }
})

let once = false; let count = 0
if (!c.repl.disable) {
  const help = function() {
    console.log('.end -> Call client.destroy() and call process.exit() 5 seconds later if don\'t down')
    console.log('.kill -> Kill this process')
    console.log('client -> A \'Discord.Client()\'')
    return
  }
  const replServer = require('repl').start(c.repl.prefix ? c.repl.prefix : '> ')
  replServer.defineCommand('help', help)
  replServer.defineCommand('kill', () => {
    process.kill(process.pid, 'SIGKILL')
  })
  replServer.defineCommand('end', function() {
    setInterval(() => {
      if (count <= 5000) {
        ++count
      } else { clearInterval(this) }
    }, 1)
    setTimeout(() => {
      logger.info('Exiting without disconnect')
      process.exit()
    }, 10000)
    if (count != 0)
      if (!once) {
        logger.info('Writing all pending saves')
        cs.write()
        logger.info('Disconnecting')
        client.destroy()
        once = true
      } else {
        logger.info('Already you tried CTRL+C. Program will exit at time out(' + (5000 - count) / 1000 + ' seconds left) or disconnected')
      }
  })
  replServer.context.client = client
} else { logger.warn('Disabled REPL because you\'re set \'disablerepl\' as \'true\' in config.yml.') }

try {
  logger.info('Logging in...')
  client.login(Buffer.from(Buffer.from(Buffer.from(s.token, 'base64').toString('ascii'), 'base64').toString('ascii'), 'base64').toString('ascii'))
    .catch(logger.error)
} catch (e) { logger.fatal(e) }

module.exports = client
