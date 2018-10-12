require('./yaml')
if (process.platform !== 'win32') require('./performance')
const logger = require('./logger').getLogger('client', 'cyan', false)
logger.info('Initializing')
const f = require('string-format')
const Discord = require('discord.js')
const client = new Discord.Client()
const mkdirp = require('mkdirp-promise')
const DBL = require('dblapi.js')
const fs = require('fs').promises
const data = require('./data')
const isTravisBuild = process.argv.includes('--travis-build')
const c = require('./config.yml')
const languages = require('./language')
const argv = require('./argument_parser')(process.argv.slice(2))
const moment = require('moment')

const getDateTime = function() {
  return moment().format('YYYY/MM/DD HH:mm:ss')
}

if (argv.debug.perf || argv.debug.performance) {
  require(__dirname + '/performance')
  logger.info('Enabled performance logging(every 5 minutes)')
}

if (argv.prefix) {
  logger.info('prefix option is present.')
  c.prefix = argv.prefix
}
logger.info(`Default prefix: ${c.prefix}`)

let s
try {
  s = isTravisBuild ? require('./travis.yml') : c
} catch (e) {
  logger.emerg('Specified option \'--travis-build\' but not found \'travis.yml\'')
    .emerg('Hint: secret.yml is removed. (merged to config.yml)')
  process.exit(1)
}
const dispatcher = require('./dispatcher')

require('./register')(client)

if (!isTravisBuild && s.dbl) new DBL(s.dbl, client)

client.on('ready', async () => {
  client.user.setActivity(`${c.prefix}help | Hello @everyone!`)
  client.setTimeout(() => {
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  }, 10000)
  logger.info(`BlackListener v${c.version} has fully startup.`)
  if (isTravisBuild || argv.debug.dryrun || argv.dryrun) {
    logger.info('Shutting down...')
    await client.destroy()
    process.exit()
  }
})

client.on('message', async msg => {
  if (!msg.guild && msg.author.id !== client.user.id) msg.channel.send('Currently not supported DM')
  if (!msg.guild) return
  await mkdirp(`${__dirname}/../data/users/${msg.author.id}`)
  await mkdirp(`${__dirname}/../data/servers/${msg.guild.id}`)
  const userMessagesFile = `${__dirname}/../data/users/${msg.author.id}/messages.log`
  const serverMessagesFile = `${__dirname}/../data/servers/${msg.guild.id}/messages.log`
  const parentName = msg.channel.parent ? msg.channel.parent.name : ''
  const user = await data.user(msg.author.id)
  user.tag = msg.author.tag
  const settings = await data.server(msg.guild.id)
  if (msg.channel.id !== settings.excludeLogging) {
    const log_message = `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}`
    fs.appendFile(userMessagesFile, log_message)
    fs.appendFile(serverMessagesFile, log_message)
  }

  const lang = languages[user.language || settings.language]

  // --- Begin of Mute
  if (settings.mute.includes(msg.author.id) && !settings.banned) {
    msg.delete(0)
    msg.author.send(lang.youaremuted)
  }
  // --- End of Mute
  if (!msg.author.bot) {
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
      logger.warn('Error while processing anti-spam.')
    }
    // --- End of Anti-spam
    dispatcher(settings, msg, lang)
  }
})

client.on('guildMemberAdd', async member => {
  await mkdirp(`${__dirname}/../data/users/${member.user.id}`)
  await mkdirp(`${__dirname}/../data/servers/${member.guild.id}`)
  const serverSetting = await data.server(member.guild.id)
  const userSetting = await data.user(member.user.id)
  const lang = languages[serverSetting.language]
  if (!serverSetting.banned) {
    if (serverSetting.banRep <= userSetting.rep && serverSetting.banRep != 0) {
      member.guild.ban(member)
        .then(() => logger.info(f(lang.autobanned, member.user.tag, member.id, member.guild.name, member.guild.id)))
        .catch(e => logger.error(e))
    } else if (serverSetting.notifyRep <= userSetting.rep && serverSetting.notifyRep != 0) {
      member.guild.owner.send(f(lang.notifymsg, member.user.tag, serverSetting.notifyRep, userSetting.rep))
    }
  }
  if (serverSetting.autorole) {
    const role = await member.guild.roles.get(serverSetting.autorole)
    member.addRole(role)
    logger.info(`Role(${role.name}) granted for: ${member.tag} in ${member.guild.name}(${member.guild.id})`)
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
  const settings = await data.server(msg.guild.id)
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
  if (olduser.username === newuser.username) return
  const user = await data.user(olduser.id)
  user.username_changes.push(`${olduser.username} -> ${newuser.username}`)
})

let once = false; let count = 0
if (!c.repl.disable || argv.repl === true) {
  if (argv.repl !== false) {
    const help = () => {
      console.log('.end -> Call client.destroy() and call process.exit() 5 seconds later if don\'t down')
      console.log('.kill -> Kill this process')
      console.log('client -> A \'Discord.Client()\'')

    }
    const exit = () => {
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
  } else { logger.info('Disabled REPL') }
} else { logger.warn('Disabled REPL because you\'re set \'disablerepl\' as \'true\' in config.yml.') }

if (argv.rcon) {
  logger.warn('Remote control is enabled.')
    .warn('Be careful for unwanted shutdown! (Use firewall to refuse from attack)')
    .info('Listener will be startup with 5123 port.')
  require('./rcon')
} else {
  logger.info('Remote control is disabled.')
    .info('If you wish to enable remote control, please add argument: \'--enable-rcon\'. (Not recommended for security reasons)')
}

logger.info('Logging in...')
if (!s.token) {
  logger.emerg('Bot token is not set.')
  process.exit(1)
}
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
    process.exit(0)
  }
})

module.exports = client
