require('./yaml')
if (process.platform !== 'win32') require('./performance')
const BlackListener = require('./core')
const {
  f,
  data,
  language: languages,
  argsresolver,
  isTravisBuild,
  config: c,
  register,
  _fs,
} = BlackListener.commons
const { Discord, LoggerFactory } = BlackListener
const logger = LoggerFactory.getLogger('client', 'cyan', false)
logger.info('Initializing')
const client = new Discord.Client()
const mkdirp = require('mkdirp-promise')
const DBL = require('dblapi.js')
const log = require(__dirname + '/log')
const argv = argsresolver(process.argv.slice(2))
const sentmute = new Set()
const dispatcher = require('./dispatcher')
const files = _fs.readdirSync(__dirname + '/components/')

if (argv.debug.perf || argv.debug.performance) {
  require(__dirname + '/performance')
  logger.info('Enabled performance logging every 5 minutes(debug level logging)')
}

if (argv.prefix) {
  logger.info('prefix option is present.')
  c.prefix = argv.prefix
}
logger.info(`Default prefix: ${c.prefix}`)

register(client)
for (const file of files) if (file.endsWith('.js')) (new (require(`${__dirname}/components/${file}`)))

if (!isTravisBuild && c.dbl) new DBL(c.dbl, client).on('error', e => logger.warn(e))

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
  if (!msg.guild) return
  const settings = await data.server(msg.guild.id)
  const user = await data.user(msg.author.id)
  user.tag = msg.author.tag
  user.bot = msg.author.bot
  user.createdTimestamp = msg.author.createdTimestamp
  if (msg.channel.id !== settings.excludeLogging) log.messageLog(msg)

  const lang = languages.get(user.language || settings.language)

  // --- Begin of Mute
  if (settings.mute.includes(msg.author.id) && !settings.banned) {
    if (!sentmute.has(msg.author.id)) {
      msg.author.send(lang.youaremuted + `\nin ${msg.guild.name}[${msg.guild.id}])!`)
      sentmute.add(msg.author.id)
    }
    msg.delete(0)
  }
  // --- End of Mute
  if (!msg.author.bot && !msg.system) dispatcher(settings, msg, lang)
})

client.on('guildMemberAdd', async member => {
  await mkdirp(`${__dirname}/../data/users/${member.user.id}`)
  await mkdirp(`${__dirname}/../data/servers/${member.guild.id}`)
  const serverSetting = await data.server(member.guild.id)
  const userSetting = await data.user(member.user.id)
  const lang = languages[serverSetting.language]
  if (!serverSetting.banned) {
    if (serverSetting.notifyRep <= userSetting.rep && serverSetting.notifyRep != 0) {
      member.guild.owner.send(f(lang.notifymsg, member.user.tag, serverSetting.notifyRep, userSetting.rep))
    }
  }
  if (serverSetting.autorole) {
    const role = await member.guild.roles.get(serverSetting.autorole)
    member.addRole(role)
    logger.info(`Role(${role.name}) granted for: ${member.tag} in ${member.guild.name}(${member.guild.id})`)
  }
  if (!client.channels.has(serverSetting.welcome_channel)) serverSetting.welcome_channel = null
  if (serverSetting.welcome_channel && serverSetting.welcome_message) {
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
    await mkdirp(`${__dirname}/../data/users/${msg.author.id}`)
    log.editedLog(old, msg)
  }
})

client.on('userUpdate', async (olduser, newuser) => {
  if (olduser.username === newuser.username && olduser.id !== newuser.id) return
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
if (!c.token) {
  logger.emerg('Bot token is not set.')
  process.exit(1)
}
client.login(c.token)
  .catch(e => {
    if (e.message.includes('ECONNRESET')) {
      logger.emerg('Unrecoverable error detected while connecting: ' + e.stack)
      process.exit(1)
    } else {
      logger.error(e)
    }
  })

process.on('message', async message => {
  if (message === 'stop') {
    setTimeout(() => {
      logger.warn('Not exiting in expected time, stopping without wait for disconnect')
      process.exit(0)
    }, 5000)
    logger.info('Received message from main, stopping!')
    await client.destroy()
  }
})

module.exports = client
