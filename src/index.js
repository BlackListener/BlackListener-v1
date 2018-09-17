require('./yaml')
const logger = require('./logger').getLogger('client', 'cyan', false)
logger.info('Initializing')
const f = require('string-format')
const Discord = require('discord.js')
const client = new Discord.Client()
const mkdirp = require('mkdirp-promise')
const DBL = require('dblapi.js')
const fs = require('fs').promises
const util = require('./util')
const isTravisBuild = process.argv.includes('--travis-build')
const c = require('./config.yml')
module.exports = client

const getDateTime = function() {
  const date = new Date()
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].join( '/' ) + ' ' + date.toLocaleTimeString()
}

if (process.env.BL_PREFIX) {
  logger.info('BL_PREFIX is present.')
  c.prefix = process.env.BL_PREFIX
}
logger.info(`Default prefix: ${c.prefix}`)

let s
try {
  s = isTravisBuild ? require('./travis.yml') : require('./secret.yml')
} catch (e) {
  logger.emerg('Not found \'secret.yml\' and not specified option \'--travis-build\' or specified option \'--travis-build\' but not found \'travis.yml\'')
    .emerg('Hint: Place secret.yml at src folder.')
  process.exit(1)
}
const {
  defaultSettings,
  defaultBans,
  defaultUser,
} = require('./contents')
const dispatcher = require('./dispatcher')

require('./register')()

let lang

if (!isTravisBuild && s.dbl) new DBL(s.dbl, client)

client.on('ready', async () => {
  await mkdirp(`${__dirname}/../error-reports`)
  await mkdirp(`${__dirname}/../crash-reports`)
  await mkdirp(`${__dirname}/../data/servers`)
  await mkdirp(`${__dirname}/../data/users`)
  await mkdirp(`${__dirname}/../plugins/commands`)
  util.initJSON(`${__dirname}/../data/bans.json`, defaultBans).catch(e => logger.error(e))
  client.user.setActivity(`${c.prefix}help | Hello @everyone!`)
  client.setTimeout(() => {
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  }, 10000)
  logger.info(`BlackListener v${c.version} has fully startup.`)
  if (isTravisBuild) {
    logger.info('Shutting down...')
    await client.destroy()
    fs.unlink('./blacklistener.pid').catch(true)
    process.exit()
  }
})

client.on('message', async msg => {
  if (!msg.guild && msg.author.id !== client.user.id) msg.channel.send('Currently not supported DM')
  if (!msg.guild) return
  const guildSettings = `${__dirname}/../data/servers/${msg.guild.id}/config.json`
  await mkdirp(`${__dirname}/../data/users/${msg.author.id}`)
  await mkdirp(`${__dirname}/../data/servers/${msg.guild.id}`)
  const userMessagesFile = `${__dirname}/../data/users/${msg.author.id}/messages.log`
  const serverMessagesFile = `${__dirname}/../data/servers/${msg.guild.id}/messages.log`
  const userFile = `${__dirname}/../data/users/${msg.author.id}/config.json`
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
  const user = Object.assign(defaultUser, await util.readJSON(userFile, defaultUser))
  const settings = Object.assign(defaultSettings, await util.readJSON(guildSettings, defaultSettings))
  logger.debug('Loading ' + guildSettings)
  await util.checkConfig(user, settings, userFile, guildSettings)
  if (msg.channel.id !== settings.excludeLogging) {
    const log_message = `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`
    fs.appendFile(userMessagesFile, log_message).catch(e => logger.error(e))
    fs.appendFile(serverMessagesFile, log_message).catch(e => logger.error(e))
  }

  // --- Begin of Mute
  if (settings.mute.includes(msg.author.id) && !settings.banned) {
    msg.delete(0)
  }
  // --- End of Mute
  if (!msg.author.bot) {
    lang = await util.readJSON(`${__dirname}/lang/${settings.language}.json`) // Processing message is under of this
    if (msg.system || msg.author.bot) return
    // --- Begin of Auto-ban
    if (!settings.banned) {
      if (settings.banRep <= user.rep && settings.banRep != 0) {
        msg.guild.ban(msg.author)
          .then(() => logger.info(f(lang.autobanned, msg.author.tag, user.id, msg.guild.name, msg.guild.id)))
          .catch(e => logger.error(e))
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
      logger.warn(`Error while processing anti-spam. (${guildSettings})`)
    }
    // --- End of Anti-spam
    dispatcher(settings, msg, lang, guildSettings)
  }
})

client.on('guildMemberAdd', async (member) => {
  const userFile = `${__dirname}/../data/users/${member.user.id}/config.json`
  const serverFile = `${__dirname}/../data/servers/${member.guild.id}/config.json`
  await mkdirp(`${__dirname}/../data/users/${member.user.id}`)
  await mkdirp(`${__dirname}/../data/servers/${member.guild.id}`)
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
        .catch(e => logger.error(e))
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
    message = message.replace(/{rep}/gm, userSetting.rep)
    message = message.replace(/{id}/gm, member.user.id)
    message = message.replace(/{username}/gm, member.user.username)
    message = message.replace(/{tag}/gm, member.user.tag)
    message = message.replace(/{users}/gm, member.guild.members.size)
    message = message.replace(/{createdAt}/gm, member.user.createdAt.toLocaleTimeString())
    message = message.replace(/{joinedAt}/gm, member.joinedAt.toLocaleTimeString())
    message = message.replace(/{avatarURL}/gm, member.user.avatarURL)
    member.guild.channels.get(serverSetting.welcome_channel).send(message)
  }
})

client.on('messageUpdate', async (old, msg) => {
  const settings = await util.readJSON(`${__dirname}/../data/servers/${msg.guild.id}/config.json`, defaultSettings)
  if (old.content === msg.content) return
  if (msg.channel.id !== settings.excludeLogging) {
    let parentName
    if (msg.channel.parent) {
      parentName = msg.channel.parent.name
    } else {
      parentName = ''
    }
    await mkdirp(`${__dirname}/../data/users/${msg.author.id}`)
    await mkdirp(`${__dirname}/../data/servers/${msg.guild.id}`)
    const editUserMessagesFile = `${__dirname}/../data/users/${msg.author.id}/editedMessages.log`
    const editServerMessagesFile = `${__dirname}/../data/servers/${msg.guild.id}/editedMessages.log`
    fs.appendFile(editUserMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`)
    fs.appendFile(editServerMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`)
  }
})

client.on('userUpdate', async (olduser, newuser) => {
  const userFile = `${__dirname}/../data/users/${olduser.id}/config.json`
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
    logger.warn(`Error while null checking (${e})`)
  }
  try {
    if (userChanged) await fs.writeFile(userFile, JSON.stringify(user, null, 4), 'utf8')
    if (olduser.username !== newuser.username) user.username_changes.push(`${olduser.username} -> ${newuser.username}`)
  } catch (e) {
    logger.warn(e.stack)
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
  const exit = function() {
    setInterval(() => {
      if (count <= 5000) {
        ++count
      } else { clearInterval(this) }
    }, 1)
    setTimeout(() => {
      logger.info('Exiting without disconnect')
      process.exit()
    }, 5000)
    setTimeout(() => {
      logger.warn('Force exiting without disconnect')
      process.kill(process.pid, 'SIGKILL')
    }, 10000)
    if (count != 0)
      if (!once) {
        logger.info('Caught INT signal, shutdown.')
        client.destroy()
        once = true
      } else {
        logger.info('Already you tried CTRL+C. Program will exit at time out(' + (5000 - count) / 1000 + ' seconds left) or disconnected')
      }
  }
  const replServer = require('repl').start(c.repl.prefix || '> ')
  replServer.defineCommand('help', help)
  replServer.defineCommand('kill', () => process.kill(process.pid, 'SIGKILL'))
  replServer.defineCommand('end', exit)
  replServer.context.client = client
  replServer.on('exit', () => {
    logger.info('Exited repl server. now exiting process...')
    exit()
  })
} else { logger.warn('Disabled REPL because you\'re set \'disablerepl\' as \'true\' in config.yml.') }

logger.info('Logging in...')
client.login(s.token)
  .catch(e => logger.error(e))

process.on('message', async message => {
  if (message === 'stop') {
    setTimeout(() => {
      logger.warn('Not exiting in expected time, stopping without wait for disconnect')
      process.exit(0)
    }, 5000)
    logger.info('Received message from main, stopping!')
    await client.destroy()
    await fs.unlink('./blacklistener.pid')
    process.exit(0)
  }
})

if (process.env.ENABLE_RCON) {
  logger.warn('Remote control is enabled.')
    .warn('Be careful for unwanted shutdown! (Use firewall to refuse from attack)')
    .info('Listener will be startup with 5123 port.')
  require('./ShutdownPacketListener')
} else {
  logger.info('Remote control is disabled.')
    .info('If you wish to enable remote control, please set some string in \'ENABLE_RCON\'. (Not recommended for security reasons)')
}
