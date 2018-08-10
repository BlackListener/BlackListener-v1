require('json5/lib/register')
const f = require('string-format')
const now = require('performance-now')
const Discord = require('discord.js')
const client = new Discord.Client()
const mkdirp = require('mkdirp')
const {promisify} = require('util')
const fetch = require('node-fetch')
const os = require('os')
const DBL = require('dblapi.js')
const randomPuppy = require('random-puppy')
const fsp = require('fs').promises
const exec = promisify(require('child_process').exec)
const crypto = require('crypto')
const isWindows = process.platform === 'win32'
const FormData = require('form-data')
const util = require('./util')
const c = require('./config.json5')
const logger = require('./logger')
const levenshtein = require('fast-levenshtein').get
const isTravisBuild = process.argv[2] === '--travis-build'
const s = isTravisBuild ? require('./travis.json5') : require('./secret.json5')
const bansFile = './data/bans.json'
const {
  defaultSettings,
  defaultBans,
  defaultUser,
  commandList,
} = require('./contents')
let lang

require('repl').start().context.client = client

function addRole(msg, rolename, isCommand = true, guildmember = null) {
  let role = null
  let member = null
  try {
    try {
      role = msg.guild.roles.find("name", rolename);
    } catch (e) {
      try {
        role = msg.guild.roles.get(rolename);
      } catch (e) {
        logger.error("An error occurred in 'addRole': " + e);
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
}

if (!isTravisBuild && s.dbl) new DBL(s.dbl, client)

client.on('warn', (warn) => {
  logger.warn(`Got Warning from Client: ${warn}`)
})

client.on('disconnect', () => {
  logger.info('Disconnected from Websocket.')
  process.exit()
})

client.on('reconnecting', () => {
  logger.fatal('Got Disconnected from Websocket, Reconnecting!')
})

client.on('ready', async () => {
  await mkdirp('./data/servers')
  await mkdirp('./data/users')
  util.initJSON(bansFile, defaultBans).catch(logger.error)
  client.user.setActivity(`${c.prefix}help | Hello @everyone!`)
  client.setTimeout(() => {
    client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
  }, 10000)
  logger.info('Bot has Fully startup.')
  if (isTravisBuild) {
    logger.info('Shutting down...')
    await client.destroy()
    process.exit()
  }
})

client.on('message', async msg => {
  if (!msg.guild && msg.author.id !== client.user.id) msg.channel.send('Currently not supported DM')
  if (!msg.guild) return
  const guildSettings = `./data/servers/${msg.guild.id}/config.json`
  await mkdirp(`./data/users/${msg.author.id}`)
  await mkdirp(`./data/servers/${msg.guild.id}`)
  const userMessagesFile = `./data/users/${msg.author.id}/messages.log`
  const serverMessagesFile = `./data/servers/${msg.guild.id}/messages.log`
  const userFile = `./data/users/${msg.author.id}/config.json`
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
  const user = await util.readJSON(userFile, defaultUser)
  let settings = await util.readJSON(guildSettings, defaultSettings)
  //logger.debug("Loading " + guildSettings);
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
  if (userChanged) await fsp.writeFile(userFile, JSON.stringify(user, null, 4), 'utf8')
  if (serverChanged) await fsp.writeFile(guildSettings, JSON.stringify(settings, null, 4), 'utf8')
  try {
    if (msg.channel.id !== settings.excludeLogging) {
      fsp.appendFile(userMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`)
      fsp.appendFile(serverMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n`)
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
  const bans = await util.readJSON(bansFile)
  // --- Begin of Mute
  if (settings.mute.includes(msg.author.id) && !settings.banned) {
    msg.delete(0)
  }
  // --- End of Mute
  if (!msg.author.bot) {
    lang = await util.readJSON(`./lang/${settings.language}.json`) // Processing message is under of this
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

    if (msg.content.startsWith(settings.prefix)) {
      if (settings.banned && msg.author.id !== '254794124744458241') { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)) }
      const args = msg.content.replace(settings.prefix, '').split(' ')
      if (args[0] === 'image') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        const sendImage = async list => {
          msg.channel.send(lang.searching)
          if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
          const sub = list[Math.round(Math.random() * (list.length - 1))]
          const url = await randomPuppy(sub)
          const attachment = new Discord.Attachment(url)
          msg.channel.send(attachment).catch(msg.channel.send)
        }
        if (args[1] === 'custom') {
          if(/\s/gm.test(args[2])) return msg.channel.send(lang.cannotspace)
          return await sendImage([args[2]])
        } else if (args[1] === 'anime') {
          return await sendImage([
            'Undertale',
            'awwnime',
            'Gunime',
            'anime',
            'animemes',
            'anikyar_ja',
            'PopTeamEpic',
            'GJbu',
            'touhou',
            'anime_irl',
            'animegifs',
            'AnimeFigures',
          ])
        } else if (['nsfw', 'r18'].includes(args[1])) {
          await sendImage([
            'HENTAI_GIF',
            'hentai_irl',
            'NSFW_Wallpapers',
            'SexyWallpapers',
            'HighResNSFW',
            'nsfw_hd',
            'UHDnsfw',
          ])
        } else {
          const embed = new Discord.RichEmbed().setImage('https://i.imgur.com/rc8mMFi.png').setTitle('引数が').setColor([0,255,0])
            .setDescription(':thumbsdown: 足りないのでコマンド実行できなかったよ :frowning:\n:thumbsdown: もしくは引数が間違ってるよ :frowning:')
          return msg.channel.send(embed).catch(logger.error)
        }
      } else if (msg.content === settings.prefix + 'info') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        const graph = 'Device          Total  Used Avail Use% Mounted on\n'
        let o1 = '利用不可'
        let loadavg = '利用不可'
        const invite = s.inviteme
        if (!isWindows) {
          const { stdout } = await exec('df -h | grep /dev/sda')
          o1 = stdout
          loadavg = Math.floor(os.loadavg()[0] * 100) / 100
        }
        const embed = new Discord.RichEmbed()
          .setTitle('Bot info')
          .setTimestamp()
          .setColor([0,255,0])
          .addField(lang.info.memory, `${lang.info.memory_max}: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_usage}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_free}: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`)
          .addField(lang.info.cpu, `${lang.info.threads}: ${os.cpus().length}\n${lang.info.cpu_model}: ${os.cpus()[0].model}\n${lang.info.cpu_speed}: ${os.cpus()[0].speed}`)
          .addField(lang.info.disk, `${graph}${o1}`)
          .addField(lang.info.platform, `${os.platform}`)
          .addField(lang.info.loadavg, `${loadavg}`)
          .addField(lang.info.servers, `${client.guilds.size}`)
          .addField(lang.info.users, `${client.users.size}`)
          .addField(lang.info.createdBy, `${client.users.get('254794124744458241').tag} (${client.users.get('254794124744458241').id})`)
          .setDescription(`[${lang.info.invite}](${invite})\n[${lang.info.source}](${c.github})\n[![Discord Bots](https://discordbots.org/api/widget/456966161079205899.svg)](https://discordbots.org/bot/456966161079205899)`)
          .setFooter(`Sent by ${msg.author.tag}`)
        return msg.channel.send(embed)
      } else if (msg.content.startsWith(settings.prefix + 'encode ')) {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        const cmd = settings.prefix + 'encode '
        return await msg.channel.send(new Buffer.from(msg.content.slice(cmd.length)).toString('base64'))
      } else if (msg.content.startsWith(settings.prefix + 'decode ')) {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        return await msg.channel.send(new Buffer.from(args[1], 'base64').toString('ascii'))
      } else if (msg.content.startsWith(settings.prefix + 'encrypt ')) {
        if (!args[2]) return msg.channel.send(lang.invalid_args)
        const cipher = crypto.createCipher('aes192', args[2])
        cipher.update(args[1], 'utf8', 'hex')
        const encryptedText = cipher.final('hex')
        return await msg.channel.send(f(lang.encrypted, args[1], args[2], encryptedText))
      } else if (msg.content.startsWith(settings.prefix + 'decrypt ')) {
        if (!args[2]) return await msg.channel.send(lang.invalid_args)
        let decipher; let dec
        try {
          decipher = crypto.createDecipher('aes192', args[2])
          decipher.update(args[1], 'hex', 'utf8')
          dec = decipher.final('utf8')
        } catch (e) {
          return await msg.channel.send(f(lang.invalid_password, args[2]))
        }
        return await msg.channel.send(f(lang.decrypted, args[1], args[2], dec))
      } else if (msg.content.startsWith(settings.prefix + 'didyouknow ')) {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        if (args[2] === 'server') {
          let know = client.guilds.find('name', args[1])
          if (!know) know = client.guilds.get(args[1])
          if (!know) {
            return await msg.channel.send(f(lang.unknown, args[1]))
          } else {
            return await msg.channel.send(f(lang.known, `${know.name} (${know.id})`))
          }
        }
        let know = client.users.find('username', args[1])
        if (!know) know = msg.mentions.users.first()
        if (!know) know = client.users.get(args[1])
        if (!know) {
          return await msg.channel.send(f(lang.unknown, args[1]))
        } else {
          return await msg.channel.send(f(lang.known, `${know.tag} (${know.id})`))
        }
      } else if (msg.content === settings.prefix + 'members') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        return await msg.channel.send(msg.guild.members.size)
      } else if (msg.content === settings.prefix + 'banned') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        return await msg.channel.send(lang.wrong_banned)
      } else if (msg.content.startsWith(settings.prefix + 'music') || msg.content.startsWith(settings.prefix + 'play')) {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        return await msg.channel.send(f(lang.musicbotis, s.musicinvite))
      } else if (msg.content.startsWith(settings.prefix + 'releases ') || msg.content === settings.prefix + 'releases') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        const versions = [
          '1.1',
          '1.1.1',
          '1.1.2',
        ]
        if (!versions.includes(args[1])) return msg.channel.send(lang.invalidVersion)
        if (args[1]) {
          return await msg.channel.send(f(`http://go.blacklistener.tk/go/release_notes/${args[1]}`))
        } else {
          return await msg.channel.send(f('http://go.blacklistener.tk/go/history'))
        }
      } else if (msg.content === settings.prefix + 'help' || msg.content.startsWith(settings.prefix + 'help ')) {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        if (args[1]) return await msg.channel.send(f(`http://go.blacklistener.tk/go/commands/${args[1]}`))
        const prefix = settings.prefix
        const embed = new Discord.RichEmbed()
          .setTitle(f(lang.commands.title, c.version))
          .setTimestamp()
          .setColor([0,255,0])
          .addField(`${prefix}setprefix`, lang.commands.setprefix)
          .addField(`${prefix}ban [<User> <Reason> <Probe>] | ${prefix}unban`, `${lang.commands.ban} | ${lang.commands.unban}`)
          .addField(`${prefix}language`, lang.commands.language)
          .addField(`${prefix}setnotifyrep | ${prefix}setbanrep`, `${lang.commands.setnotifyrep} | ${lang.commands.setbanrep}`)
          .addField(`${prefix}antispam`, lang.commands.antispam)
          .addField(`${prefix}dump [guilds|users|channels|emojis|messages] [messages:delete/size]`, lang.commands.dump)
          .addField(`${prefix}invite`, lang.commands.invite)
          .addField(`${prefix}role <role> [user] __/__ ${prefix}autorole [add/remove] <role>`, `${lang.commands.role}\n${lang.commands.autorole}`)
          .addField(`${prefix}image [nsfw|anime|custom] [subreddit]`, lang.commands.image)
          .addField(`${prefix}lookup <User>`, lang.lookup.desc)
          .addField(lang.commands.others, lang.commands.athere)
        return await msg.channel.send(embed)
      } else if (msg.content.startsWith(settings.prefix + 'lookup ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        let id; let force = false
        if (msg.mentions.users.first()) {
          id = msg.mentions.users.first().id
        } else {
          if (args[2] === '--force') { force = true; id = lang.sunknown }
          if (!force) {
            if (/\D/gm.test(args[1])) {
              try {
                id = client.users.find('username', args[1]).id
              } catch (e) {
                try {
                  id = msg.guild.members.find('nickname', args[1]).id
                } catch (e) {
                  logger.error(e)
                  return msg.channel.send(f(lang.unknown, args[1]))
                }
              }
            } else if (/\d{18}/.test(args[1])) {
              let ok = false
              try {
                id = client.users.get(args[1]).id
                ok = true
              } catch (e) {
                try {
                  if (!ok) {
                    id = client.users.find('username', args[1]).id
                    ok = true
                  }
                } catch (e) {
                  try {
                    if (!ok) id = msg.guild.members.find('nickname', args[1]).id
                  } catch (e) {
                    msg.channel.send(f(lang.unknown, args[1]))
                    return logger.error(e)
                  }
                }
              }
            } else {
              try {
                id = client.users.find('username', args[1]).id
              } catch (e) {
                try {
                  id = msg.guild.members.find('nickname', args[1]).id
                } catch (e) {
                  logger.error(e)
                  return msg.channel.send(f(lang.unknown, args[1]))
                }
              }
            }
          }
        }
        let userConfig
        let user2
        const sb = ['BANされていません']
        const sb2 = ['BANされていません']
        const sb3 = ['BANされていません']
        const sb4 = ['BANされていません']
        const sb6 = [lang.no]
        let isBot = lang.no
        try {
          userConfig = await util.readJSON(`./data/users/${id}/config.json`)
          user2 = client.users.get(id)
        } catch (e) {
          logger.error(e)
          return msg.channel.send(f(lang.unknown, args[1]))
        }
        if (!force) { if (user2.bot) isBot = lang.yes } else { isBot = lang.sunknown }
        try {
          for (let i=0;i<=userConfig.probes.length;i++) {
            let once = false
            if (userConfig.bannedFromServer[i] != null) {
              if (!once) {
                sb.length = 0
                sb2.length = 0
                sb3.length = 0
                sb4.length = 0
                once = true
              }
              sb.push(`${userConfig.bannedFromServer[i]} (${userConfig.bannedFromServerOwner[i]})`)
            }
            if (userConfig.bannedFromUser[i] != null) sb2.push(userConfig.bannedFromUser[i])
            if (userConfig.probes[i] != null) sb3.push(userConfig.probes[i])
            if (userConfig.reasons[i] != null) sb4.push(userConfig.reasons[i])
          }
        } catch (e) {
          sb.length = 0
          sb2.length = 0
          sb3.length = 0
          sb4.length = 0
          sb.push(lang.sunknown)
          sb2.push(lang.sunknown)
          sb3.push(lang.sunknown)
          sb4.push(lang.sunknown)
        }
        try {
          let once = false
          if (!once) {
            sb6.length = 0
            once = true
          }
          sb6.push(...userConfig.username_changes.filter(e => e))
        } catch (e) {
          sb6.length = 0
          sb6.push(lang.sunknown)
          logger.error(`Error while lookup command (sb6) ${e}`)
        }
        if (!sb6.length) sb6.push(lang.no)
        const desc = force ? lang.lookup.desc + ' ・ ' + f(lang.unknown, args[1]) : lang.lookup.desc
        const nick = msg.guild.members.get(user2.id) ? msg.guild.members.get(user2.id).nickname : lang.nul
        const joinedAt = msg.guild.members.get(user2.id) ? msg.guild.members.get(user2.id).joinedAt : lang.sunknown
        const embed = new Discord.RichEmbed()
          .setTitle(lang.lookup.title)
          .setColor([0,255,0])
          .setFooter(desc)
          .setThumbnail(user2.avatarURL)
          .addField(lang.lookup.rep, userConfig.rep)
          .addField(lang.lookup.bannedFromServer, sb.join('\n'))
          .addField(lang.lookup.bannedFromUser, sb2.join('\n'))
          .addField(lang.lookup.probes, sb3.join('\n'))
          .addField(lang.lookup.reasons, sb4.join('\n'))
          .addField(lang.lookup.tag, user2.tag)
          .addField(lang.lookup.nickname, nick)
          .addField(lang.lookup.id, user2.id)
          .addField(lang.lookup.username_changes, sb6.join('\n'))
          .addField(lang.lookup.bot, isBot)
          .addField(lang.lookup.createdAt, user2.createdAt.toLocaleString('ja-JP'))
          .addField(lang.lookup.joinedAt, joinedAt.toLocaleString('ja-JP'))
          .addField(lang.lookup.nowTime, new Date().toLocaleString('ja-JP'))
        msg.channel.send(embed)
      } else if (msg.content.startsWith(settings.prefix + 'role ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        let role;
        try {
          role = msg.guild.roles.find("name", args[1]);
        } catch (e) {
          try {
            role = msg.guild.roles.get(args[1]);
          } catch (e) {
            return msg.channel.send(lang.invalid_args);
          }
        }
        if (msg.member.highestRole.position > role.position || msg.member.hasPermission(8)) {
          if (!msg.member.hasPermission(8)) if (settings.blocked_role.includes(args[1])) return msg.channel.send(lang.udonthaveperm);
          if (!msg.mentions.members.first()) {
            addRole(msg, args[1], true);
          } else {
            addRole(msg, args[1], true, msg.mentions.members.first());
          }
        } else {
          return msg.channel.send(lang.no_perm);
        }
      } else if (msg.content === settings.prefix + 'serverinfo') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        let prefix = lang.sunknown
        let language = lang.sunknown
        let notifyRep = lang.unknownorzero
        let banRep = lang.unknownorzero
        let antispam = lang.disabled
        let banned = lang.no
        let disable_purge = lang.yes
        let ignoredChannels = lang.no
        let autorole = lang.disabled
        let excludeLogging = lang.disabled
        let welcome_channel = lang.disabled
        let welcome_message = lang.disabled
        const muteSB = [lang.no]
        const ignoredChannelsSB = [lang.no]
        const blocked_roleSB  = [lang.no]
        if (settings.prefix) prefix = `\`${settings.prefix}\``
        if (settings.language) language = `\`${settings.language}\``
        if (settings.notifyRep) notifyRep = settings.notifyRep
        if (settings.banRep) banRep = settings.banRep
        if (settings.antispam) antispam = lang.enabled
        if (settings.banned) banned = lang.yes
        if (settings.disable_purge) disable_purge = lang.no
        if (settings.autorole) autorole = `${lang.enabled} (${msg.guild.roles.get(settings.autorole).name}) [${settings.autorole}]`
        if (settings.excludeLogging) excludeLogging = `${lang.enabled} (${client.channels.get(settings.excludeLogging).name}) (\`${client.channels.get(settings.excludeLogging).id}\`)`
        if (settings.welcome_channel) welcome_channel = `${lang.enabled} (${client.channels.get(settings.welcome_channel).name})`
        if (settings.welcome_message) welcome_message = `${lang.enabled} (\`\`\`${settings.welcome_message}\`\`\`)`
        if (settings.ignoredChannels.length != 0) {
          ignoredChannelsSB.length = 0
          settings.ignoredChannels.forEach((data) => {
            if (data) {
              if (msg.guild.channels.get(data)) {
                ignoredChannelsSB.push(`<#${data}> (${msg.guild.channels.get(data).name}) (${data})`)
              } else {
                ignoredChannelsSB.push(`<#${data}> ${data} (${lang.failed_to_get})`)
              }
            }
          })
          ignoredChannels = ignoredChannelsSB.join('\n')
        }
        if (settings.mute.length != 0) {
          muteSB.length = 0
          settings.mute.forEach((data) => {
            if (data) {
              if (client.users.has(data)) {
                muteSB.push(`<@${data}> (${client.users.get(data).tag})`)
              } else {
                muteSB.push(`<@${data}> ${data} (${lang.failed_to_get})`)
              }
            }
          })
        }
        if (settings.blocked_role.length != 0) {
          muteSB.length = 0
          settings.blocked_role.forEach((data) => {
            if (data) {
              if (msg.guild.roles.has(data)) {
                blocked_roleSB.push(`${msg.guild.roles.get(data).name} (${data})`)
              } else {
                blocked_roleSB.push(`${data} (${lang.failed_to_get})`)
              }
            }
          })
        }
        const embed = new Discord.RichEmbed()
          .setTitle(' - Server Information - ')
          .setColor([0,255,0])
          .setTimestamp()
          .addField(lang.serverinfo.prefix, prefix)
          .addField(lang.serverinfo.language, language)
          .addField(lang.serverinfo.notifyRep, notifyRep)
          .addField(lang.serverinfo.banRep, banRep)
          .addField(lang.serverinfo.antispam, antispam)
          .addField(lang.serverinfo.ignoredChannels, ignoredChannels)
          .addField(lang.serverinfo.banned, banned)
          .addField(lang.serverinfo.disable_purge, disable_purge)
          .addField(lang.serverinfo.autorole, autorole)
          .addField(lang.serverinfo.excludeLogging, excludeLogging)
          .addField(lang.serverinfo.mute, muteSB.join('\n'))
          .addField(lang.serverinfo.welcome_channel, welcome_channel)
          .addField(lang.serverinfo.welcome_message, welcome_message)
          .addField(lang.serverinfo.blocked_role, blocked_roleSB.join('\n'))
        return await msg.channel.send(embed)
      } else if (msg.content === settings.prefix + 'status minecraft') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        msg.channel.send(lang.status.checking)
        const status = ['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined']
        let i = 0
        const startTime = now()
        const data = await fetch('https://status.mojang.com/check').then(res => res.json())
        for (; i < data.length; i ++) {
          for (const key in data[i]){
            switch (data[i][key]){
              case 'green':
                status[i] = lang.status.ok
                break
              case 'red':
                status[i] = lang.status.down
                break
              case 'yellow':
                status[i] = lang.status.unstable
                break
              default:
                status[i] = lang.status.unknown
                break
            }
          }
        }
        const endTime = now()
        const time = endTime - startTime
        const embed = new Discord.RichEmbed()
          .setTitle(lang.status.title)
          .setURL('https://help.mojang.com')
          .setColor([0,255,0])
          .setFooter(f(lang.status.time, Math.floor(time)))
          .setTimestamp()
          .addField(lang.status.servers.minecraft, status[0])
          .addField(lang.status.servers.sessionminecraft, status[1])
          .addField(lang.status.servers.accountmojang, status[2])
          .addField(lang.status.servers.authservermojang, status[3])
          .addField(lang.status.servers.sessionservermojang, status[4])
          .addField(lang.status.servers.apimojang, status[5])
          .addField(lang.status.servers.texturesminecraft, status[6])
          .addField(lang.status.servers.mojang, status[7])
        return msg.channel.send(embed)
      } else if (msg.content === settings.prefix + 'status fortnite') {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        if (s.fortnite_api_key === '') return msg.channel.send(lang.no_apikey)
        msg.channel.send(lang.status.checking)
        let status = 'Unknown'
        const startTime = now()
        const data = await fetch('https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status', {
          method: 'POST',
          headers: {
            'Authorization': s.fortnite_api_key,
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
          },
          body: new FormData().append('username', 'username'),
        }).then(res => res.json())
        if (data.status === 'UP') {
          status = lang.status.ok
        } else if (data.status === 'DOWN') {
          status = lang.status.down
        } else {
          status = lang.status.unknown
        }
        const endTime = now()
        const time = endTime - startTime
        const embed = new Discord.RichEmbed()
          .setTitle(lang.status.title)
          .setURL('https://status.epicgames.com')
          .setColor([0,255,0])
          .setFooter(f(lang.status.time, Math.floor(time)))
          .setTimestamp()
          .addField(lang.status.servers.fortnite, status)
        return msg.channel.send(embed)
      } else if (msg.content.startsWith(settings.prefix + 'talkja ')) {
        logger.info(f(lang.issueduser, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        if (s.talk_apikey == '' || s.talk_apikey == 'undefined' || !s.talk_apikey) return msg.channel.send(lang.no_apikey)
        let status = '？？？'
        const header = {
          'x-api-key': s.talk_apikey,
          'Content-Type': 'application/json',
        }
        const resreg = await fetch('https://api.repl-ai.jp/v1/registration', { method: 'POST', body: '{botId: sample}', headers: header })
        if (resreg.status !== 200) return msg.channel.send(lang.returned_invalid_response)
        const resjson = await resreg.json()
        const userId = resjson.appUserId
        const talkform = `{ "botId": "sample", "appUserId": ${userId}, "initTalkingFlag": true, "voiceText": ${args[1]}, "initTopicId": "docomoapi" }`
        const talkheader = {
          'x-api-key': s.talk_apikey,
          'Content-Type': 'application/json',
        }
        return (async function () {
          const res = await fetch('https://api.repl-ai.jp/v1/dialogue', { method: 'POST', body: talkform, headers: talkheader })
          if (res.status !== 200) return msg.channel.send(lang.returned_invalid_response)
          const data = await res.json()
          status = data.systemText.expression
          await msg.channel.send(status.replace('#', ''))
        }) ()
      } else if (msg.content === settings.prefix + 'invite') {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
        return await msg.channel.send(f(lang.invite_bot, s.inviteme))
      }
      if (msg.member.hasPermission(8) || msg.author == '<@254794124744458241>') {
        if (msg.content === settings.prefix + 'togglepurge' || msg.content.startsWith(settings.prefix + 'togglepurge ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const unsavedSettings = settings
          if (args[1] === 'enable') {
            unsavedSettings.disable_purge = false
          } else if (args[1] === 'disable') {
            unsavedSettings.disable_purge = true
          } else {
            if (settings.disable_purge) {
              unsavedSettings.disable_purge = false
            } else if (!settings.disable_purge) {
              unsavedSettings.disable_purge = true
            }
          }
          await writeSettings(guildSettings, unsavedSettings, msg.channel, 'disable_purge')
        } else if (msg.content.startsWith(settings.prefix + 'shutdown ') || msg.content === settings.prefix + 'shutdown') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (msg.author == '<@254794124744458241>') {
            if (args[1] == '-f') {
              logger.info(f(lang.atmpfs, msg.author.tag))
              msg.channel.send(lang.bye)
              client.destroy()
            } else if (args[1] == '-r') {
              (async () => {
                logger.info(f(lang.rebooting))
                await msg.channel.send(lang.rebooting)
                process.kill(process.pid, 'SIGKILL')
              })()
            } else {
              logger.info(f(lang.success, msg.content))
              msg.channel.send(lang.bye)
              client.destroy()
            }
          } else {
            msg.reply(lang.udonthaveperm)
            logger.info(f(lang.failednotmatch, msg.content))
          }
        } else if (msg.content.startsWith(settings.prefix + 'setignore')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          let channel
          if (msg.mentions.channels.first()) {
            channel = msg.mentions.channels.first()
          } else if (/\D/.test(args[1])) {
            channel = msg.guild.channels.find('name', args[1])
          } else if (/\d{18}/.test(args[1])) {
            try {
              channel = msg.guild.channels.get(args[1])
            } catch (e) {
              channel = msg.guild.channels.find('name', args[1])
            }
          } else {
            channel = msg.guild.channels.find('name', args[1])
          }
          if (!channel) return msg.channel.send(lang.invalid_args)
          const id = channel.id
          settings.excludeLogging = id
          await writeSettings(guildSettings, settings, msg.channel, 'excludeLogging')
        } else if (msg.content === settings.prefix + 'token') {
          if (msg.author.id === '254794124744458241') {
            msg.author.send(f(lang.mytoken, client.token))
            msg.reply(lang.senttodm)
            logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
            const embed = new Discord.RichEmbed()
            embed.description = 'You\'ll need to set - add permission - \'Manage Messages\' => \'Save Changes\''
            embed.setColor([255, 0, 0])
            msg.delete(5000).catch(() => { msg.channel.send(':no_good: Missing permission: \'manage message\'', embed); logger.error('Error: missing \'manage message\' permission.')})
          } else {
            msg.reply(lang.youdonthavear)
            logger.info(f(lang.issuedfailadmin, msg.author.tag, msg.content, 'Doesn\'t have Admin Role'))
          }
        } else if (msg.content.startsWith(settings.prefix + 'ban ') || msg.content === settings.prefix + 'ban') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (!args[1] || args[1] === '') {
            const bans = await Promise.all(util.readJSONSync(bansFile).map(async (id) => {
              const user = await client.fetchUser(id).catch(() => { }) || lang.failed_to_get
              return `${user.tag} (${id})`
            }))
            const embed = new Discord.RichEmbed()
              .setTitle(lang.banned_users)
              .setColor([0,255,0])
              .setDescription(bans.join('\n') || 'まだ誰もBANしていません')
            msg.channel.send(embed)
          } else {
            if (msg.guild && msg.guild.available && !msg.author.bot) {
              !(async () => {
                if (!args[2]) return msg.channel.send(lang.invalid_args)
                let user2
                let fetchedBans
                let attach
                const reason = args[2]
                if (args[3] !== '--force') { if (user.bannedFromServerOwner.includes(msg.guild.ownerID) && user.bannedFromServer.includes(msg.guild.id) && user.bannedFromUser.includes(msg.author.id)) return msg.channel.send(lang.already_banned) }
                if (msg.mentions.users.first()) {
                  user2 = msg.mentions.users.first()
                } else if (/\d{18}/.test(args[1])) {
                  args[1] = args[1].replace('<@', '').replace('>', '')
                  fetchedBans = await msg.guild.fetchBans()
                  if (fetchedBans.has(args[1])) {
                    user2 = fetchedBans.get(args[1])
                  } else {
                    user2 = client.users.get(args[1])
                  }
                } else {
                  user2 = client.users.find('username', args[1])
                  if (!user2) user2 = client.users.get(args[1])
                }
                if (!msg.attachments.first()) {
                  return msg.channel.send(lang.invalid_args)
                } else {
                  attach = msg.attachments.first().url
                }
                if (msg.mentions.users.first()) { user2 = msg.mentions.users.first() }
                if (args[3] !== '--force') { if (!user2) { return msg.channel.send(lang.invalid_user) } }
                let userid
                if (args[3] === '--force') { userid = args[1] } else { userid = user2.id }
                const userr = await util.readJSON(`./data/users/${userid}/config.json`, defaultUser)
                userr.bannedFromServerOwner.push(msg.guild.ownerID)
                userr.bannedFromServer.push(msg.guild.id)
                userr.bannedFromUser.push(msg.author.id)
                userr.probes.push(attach)
                userr.reasons.push(reason)
                bans.push(userid)
                userr.rep = ++userr.rep
                const targetUserFile = `./data/users/${userid}/config.json`
                await fsp.writeFile(bansFile, JSON.stringify(bans, null, 4), 'utf8')
                await fsp.writeFile(targetUserFile, JSON.stringify(userr, null, 4), 'utf8')
                if (!msg.guild.members.has(userid)) return msg.channel.send(lang.banned)
                msg.guild.ban(userid, { 'reason': reason })
                  .then(user2 => logger.info(`Banned user: ${user2.tag} (${user2.id}) from ${msg.guild.name}(${msg.guild.id})`))
                  .catch(logger.error)
                return msg.channel.send(lang.banned)
              })()
            }
          }
        } else if (msg.content.startsWith(settings.prefix + 'purge ') || msg.content === settings.prefix + 'purge') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (msg.author.id === '254794124744458241') {
            if (!msg.member.hasPermission(8)) return msg.channel.send(lang.udonthaveperm)
          }
          if (settings.disable_purge) return msg.channel.send(lang.disabled_purge)
          let messages
          if (args[1] === '' || !args[1] || args[1] === 'all') {
            const clear = () => {
              msg.channel.fetchMessages()
                .then((messages) => {
                  msg.channel.bulkDelete(messages)
                  if (messages.length >= 100) {
                    clear()
                  }
                })
            }
            clear()
          } else if (/[^0-9]/.test(args[1]) && args[1] === 'gdel-msg') {
            msg.guild.channels.forEach((channel) => {
              const clear = () => {
                channel.fetchMessages()
                  .then((messages) => {
                    channel.bulkDelete(messages)
                    if (messages.length >= 100) {
                      clear()
                    }
                  })
              }
              clear()
            })
          } else if (/[^0-9]/.test(args[1]) && args[1] === 'gdel') {
            msg.guild.channels.forEach((channel) => { channel.delete() })
            msg.guild.createChannel('general', 'text')
          } else if (/[^0-9]/.test(args[1]) && args[1] === 'gdel-really') {
            msg.guild.channels.forEach((channel) => { channel.delete() })
          } else if (args[1] === 'remake') {
            if (!msg.mentions.channels.first()) return msg.channel.send(lang.no_args)
            try {
              (async () => {
                const channel = msg.mentions.channels.first()
                msg.channel.send(':ok_hand:')
                channel.delete('Remake of Channel')
                const created_channel = await msg.guild.createChannel(channel.name, channel.type)
                if (channel.parent) {
                  created_channel.setParent(channel.parentID)
                }
                created_channel.setPosition(channel.position)
              })()
            } catch (e) {
              logger.error(e)
            }
          } else if (/[0-9]/.test(args[1])) {
            if (parseInt(args[1]) > 99 || parseInt(args[1]) < 1) {
              msg.channel.send(lang.outofrange)
            }
            (async () => {
              messages = await msg.channel.fetchMessages({limit: parseInt(args[1]) + 1})
              msg.channel.bulkDelete(messages)
                .catch(logger.error)
            })()
          } else {
            msg.channel.send(lang.invalid_args)
          }
        } else if (msg.content.startsWith(settings.prefix + 'unban ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (!args[1] || args[1] === '') {
            msg.channel.send(lang.no_args)
          } else {
            if (msg.guild && msg.guild.available && !msg.author.bot) {
              let user2
              if (/[0-9]................./.test(args[1])) {
                user2 = client.users.get(args[1])
              } else {
                user2 = client.users.find('username', args[1])
              }
              if (msg.mentions.users.first()) user2 = msg.mentions.users.first()
              if (!user2) { settings = null; return msg.channel.send(lang.invalid_user) }
              const ban = bans
              let exe = false
              for (let i=0; i<=bans.length; i++) {
                if (bans[i] == user2.id) {
                  exe = true
                  delete ban[i]
                }
              }
              if (!exe) { settings = null; return msg.channel.send(lang.notfound_user) }
              for (let i=0; i<=client.guilds.length; i++) {
                client.guilds[i].unban(user2)
                  .then(user2 => logger.info(`Unbanned user(${i}): ${user2.tag} (${user2.id}) from ${client.guilds[i].name}(${client.guilds[i].id})`))
                  .catch(logger.error)
              }
              user.rep = --user.rep
              await writeSettings(bansFile, ban, null, null, false)
              await writeSettings(userFile, user, null, null, false)
              msg.channel.send(lang.unbanned)
            } else {
              msg.channel.send(lang.guild_unavailable)
            }
          }
        } else if (msg.content.startsWith(settings.prefix + 'mute')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          let user2; const muteSB = [lang.no]
          if (!args[1]) {
            if (settings.mute.length != 0) {
              muteSB.length = 0
              settings.mute.forEach((data) => {
                if (data) {
                  if (client.users.has(data)) {
                    muteSB.push(`<@${data}> (${client.users.get(data).tag})`)
                  } else {
                    muteSB.push(`<@${data}> ${data} (${lang.failed_to_get})`)
                  }
                }
              })
            }
            return msg.channel.send(new Discord.RichEmbed()
              .setTitle(lang.serverinfo.mute)
              .addField(lang.serverinfo.mute, muteSB.join('\n'))
            )
          }
          try {
            user2 = client.users.find('username', args[1]).id
          } catch (e) {
            try {
              user2 = client.users.get(args[1]).id
            } catch (e) {
              try {
                user2 = msg.mentions.users.first().id
              } catch (e) {
                return msg.channel.send(lang.invalid_args)
              }
            }
          }
          if (!user2 || user2 === msg.author.id || user2 === client.user.id) return msg.channel.send(lang.invalid_args)
          if (settings.mute.includes(user2) || args[2] === 'unmute') {
            const result = settings.mute.filter( item => item !== user2)
            settings.mute = result
          } else if (args[2] === 'mute') {
            settings.mute.push(user2)
          } else {
            settings.mute.push(user2)
          }
          await writeSettings(guildSettings, settings, msg.channel, 'mute')
        } else if (msg.content.startsWith(settings.prefix + 'setprefix ') || msg.content.startsWith(settings.prefix + 'prefix ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const set = settings
          if (/\s/gm.test(args[1]) || !args[1]) {
            msg.channel.send(lang.cannotspace)
          } else {
            set.prefix = args[1]
            await writeSettings(guildSettings, set, msg.channel, 'prefix')
          }
        } else if (msg.content.startsWith(settings.prefix + 'setnick ') || msg.content.startsWith(settings.prefix + 'setnickname ') || msg.content.startsWith(settings.prefix + 'resetnick ') || msg.content === settings.prefix + 'resetnick') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (args[0] === 'resetnick') {
            if (/\s/gm.test(args[1]) || !args[1]) { msg.guild.me.setNickname(client.user.username); return msg.channel.send(':ok_hand:') }
            try {
              msg.guild.members.get(client.users.find('username', args[1]).id).setNickname(msg.mentions.members.first().user.username)
              return msg.channel.send(':ok_hand:')
            } catch (e) {
              try {
                msg.guild.members.get(args[1]).setNickname(msg.mentions.members.first().user.username)
                return msg.channel.send(':ok_hand:')
              } catch (e) {
                try {
                  msg.mentions.members.first().setNickname(msg.mentions.members.first().user.username)
                  return msg.channel.send(':ok_hand:')
                } catch (e) {
                  logger.error(e)
                  msg.channel.send(lang.invalid_args)
                }
              }
            }
          } else {
            if (/\s/gm.test(args[1]) || !args[1]) {
              msg.channel.send(lang.cannotspace)
            } else {
              if (args[2] != null) {
                try {
                  msg.guild.members.get(client.users.find('username', args[2]).id).setNickname(args[1])
                  return msg.channel.send(':ok_hand:')
                } catch(e) {
                  try {
                    msg.guild.members.get(args[2]).setNickname(args[1])
                    return msg.channel.send(':ok_hand:')
                  } catch (e) {
                    try {
                      msg.mentions.members.first().setNickname(args[1])
                      return msg.channel.send(':ok_hand:')
                    } catch (e) {
                      logger.error(e)
                      msg.channel.send(lang.invalid_args)
                    }
                  }
                }
              } else {
                msg.guild.me.setNickname(args[1])
                return msg.channel.send(':ok_hand:')
              }
            }
          }
        } else if (msg.content.startsWith(settings.prefix + 'setnotifyrep ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const set = settings
          const n = parseInt(args[1], 10)
          const min = 0
          const max = 10
          const status = n >= min && n <= max
          if (!status || args[1] == null) {
            msg.channel.send(lang.invalid_args)
          } else {
            set.notifyRep = parseInt(args[1], 10)
            await writeSettings(guildSettings, set, msg.channel, 'notifyRep')
          }
        } else if (msg.content.startsWith(settings.prefix + 'setbanrep ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const set = settings
          const n = parseInt(args[1], 10)
          const min = 0
          const max = 10
          const status = n >= min && n <= max
          if (!status || args[1] == null) {
            msg.channel.send(lang.invalid_args)
          } else {
            set.banRep = parseInt(args[1], 10)
            await writeSettings(guildSettings, set, msg.channel, 'banRep')
          }
        } else if (msg.content.startsWith(settings.prefix + 'antispam ') || msg.content === settings.prefix + 'antispam') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const command = `${settings.prefix}antispam`
          const off = '無効'
          const on = '有効'
          if (!args[1] || args[1] === 'help') {
            let status
            if (settings.antispam) {
              status = on
            } else {
              status = off
            }
            const embed = new Discord.RichEmbed()
              .setTitle(' - AntiSpam - ')
              .setDescription(f(lang.antispam.description, status))
              .addField(`${command} toggle`, lang.antispam.toggle)
              .addField(`${command} disable`, lang.antispam.disable)
              .addField(`${command} enable`, lang.antispam.enable)
              .addField(`${command} ignore <#Channel>`, lang.antispam.ignore)
              .addField(`${command} status <#Channel>`, lang.antispam.status)
              .setTimestamp()
            msg.channel.send(embed)
          } else if (args[1] === 'toggle') {
            if (settings.antispam) {
              const localSettings = settings
              localSettings.antispam = false
              await writeSettings(guildSettings, localSettings, null, null, false)
              msg.channel.send(lang.antispam.disabled)
            } else {
              const localSettings = settings
              localSettings.antispam = true
              await writeSettings(guildSettings, localSettings, null, null, false)
              msg.channel.send(lang.antispam.enabled)
            }
          } else if (args[1] === 'disable') {
            const localSettings = settings
            localSettings.antispam = false
            await writeSettings(guildSettings, localSettings, null, null, false)
            msg.channel.send(lang.antispam.disabled)
          } else if (args[1] === 'enable') {
            const localSettings = settings
            localSettings.antispam = true
            await writeSettings(guildSettings, localSettings, null, null, false)
            msg.channel.send(lang.antispam.enabled)
          } else if (args[1] === 'ignore') {
            if (!msg.mentions.channels.first()) { settings = null; return msg.channel.send(lang.invalid_args) }
            if (/\s/.test(args[2]) || !args[2]) { settings = null; return msg.channel.send(lang.cannotspace) }
            const localSettings = settings
            let user2 = msg.mentions.channels.first()
            if (!user2) user2 = msg.guild.channels.find('name', args[2])
            if (!user2) user2 = msg.guild.channels.get(args[2])
            const id = user2 ? user2.id : ':poop:'
            if (id === ':poop:') return msg.channel.send(lang.invalid_args)
            if (localSettings.ignoredChannels.includes(id)) {
              delete localSettings.ignoredChannels[localSettings.ignoredChannels.indexOf(id)]
              await writeSettings(guildSettings, localSettings, null, null, false)
              msg.channel.send(lang.antispam.ignore_enabled)
            } else {
              localSettings.ignoredChannels.push(id)
              await writeSettings(guildSettings, localSettings, null, null, false)
              msg.channel.send(lang.antispam.ignore_disabled)
            }
          } else if (args[1] === 'status') {
            if (!msg.mentions.channels.first()) {
              const sb = []
              settings.ignoredChannels.forEach((channel) => {
                if (channel != null) {
                  sb.push(`<#${channel}>`)
                }
              })
              return msg.channel.send(f(lang.antispam.disabled_channels, sb.join('\n')))
            }
            const id = msg.mentions.channels.first().id
            if (/\s/.test(args[2]) || !args[2]) { settings = null; return msg.channel.send(lang.cannotspace) }
            if (settings.ignoredChannels.includes(id)) {
              msg.channel.send(f(lang.antispam.status2, off))
            } else {
              msg.channel.send(f(lang.antispam.status2, on))
            }
          }
        } else if (msg.content === settings.prefix + 'autorole' || msg.content.startsWith(settings.prefix + 'autorole ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (args[1] === 'remove') {
            const localSettings = settings
            localSettings.autorole = null
            await writeSettings(guildSettings, localSettings, msg.channel, 'autorole')
          } else if (args[1] === 'add') {
            const localSettings = settings
            if (/\d{18,}/.test(args[2])) {
              localSettings.autorole = args[2]
            } else {
              try {
                const role = msg.mentions.roles.first().id.toString()
                localSettings.autorole = role
              } catch (e) {
                try {
                  const role = msg.guild.roles.find('name', args[2]).id
                  localSettings.autorole = role
                } catch (e) {
                  msg.channel.send(lang.invalid_args)
                  logger.error(e)
                }
              }
            }
            await writeSettings(guildSettings, localSettings, msg.channel, 'autorole')
          } else {
            if (settings.autorole != null) {
              msg.channel.send(f(lang.autorole_enabled, msg.guild.roles.get(settings.autorole).name))
            } else if (!settings.autorole) {
              msg.channel.send(lang.autorole_disabled)
            }
          }
        } else if (msg.content === settings.prefix + 'dump' || msg.content.startsWith(settings.prefix + 'dump ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const url = c.dump_url
          const sb = []
          let link = `${url}`
          let nowrite
          if (args[1] === 'users') {
            client.users.forEach((user) => {
              sb.push(`${user.tag} (${user.id})`)
            })
          } else if (args[1] === 'channels') {
            client.channels.forEach((channel) => {
              sb.push(`<${channel.guild.name}><${channel.guild.id}> ${channel.name} (${channel.id}) [${channel.type}]`)
            })
          } else if (args[1] === 'messages') {
            if (args[2] === 'size') {
              const {size} = await fsp.stat(`./data/servers/${msg.guild.id}/messages.log`)
              msg.channel.send(f(lang.logsize, size / 1000000.0))
            } else if (args[2] === 'delete') {
              fsp.writeFile(`./data/servers/${msg.guild.id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8')
            }
            nowrite = true
            if (c.data_baseurl == '' || !c.data_baseurl) {
              link = '利用不可'
            } else {
              link = `${c.data_baseurl}/servers/${msg.guild.id}/messages.log`
            }
          } else if (args[1] === 'emojis') {
            client.emojis.forEach((emoji) => {
              sb.push(`<${emoji.guild.name}><${emoji.guild.id}> ${emoji.name} (${emoji.id}) [isAnimated:${emoji.animated}] [ ${emoji.url} ]`)
            })
          } else if (!args[1] || args[1] === 'guilds') {
            client.guilds.forEach((guild) => {
              sb.push(`${guild.name} (${guild.id}) [ ${c.data_baseurl}/servers/${guild.id}/messages.log ]`)
            })
          }
          const image1 = 'https://img.rht0910.tk/upload/2191111432/72932264/bump.png'
          const image2 = 'https://img.rht0910.tk/upload/2191111432/710894583/dump2.png'
          let image
          if (!args[2]) {
            image = image1
          } else {
            image = image2
          }
          const embed = new Discord.RichEmbed().setImage(image)
            .setTitle(lang.dumpmessage)
            .setURL(s.inviteme)
            .setColor([140,190,210])
            .setDescription(f(lang.dumped, link))
          msg.channel.send(embed)
          if (!nowrite) {
            fsp.writeFile('./dump.txt', sb.join('\n'), 'utf8')
          }
        } else if (msg.content.startsWith(settings.prefix + 'setwelcome ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (args[1] === 'message') {
            if (!args[2]) return msg.channel.send(lang.invalid_args)
            const commandcut = msg.content.substr(`${settings.prefix}setwelcome message `.length)
            settings.welcome_message = commandcut
            await writeSettings(guildSettings, settings, msg.channel, 'welcome_message')
            msg.channel.send(lang.welcome_warning)
          } else if (args[1] === 'channel') {
            if (!args[2]) return msg.channel.send(lang.invalid_args)
            let channel
            try {
              channel = msg.guild.channels.find('name', args[2]).id
            } catch (e) {
              try {
                channel = msg.guild.channels.get(args[2]).id
              } catch (e) {
                try {
                  channel = msg.mentions.channels.first().id
                } catch (e) {
                  logger.error(e)
                  return msg.channel.send(`${lang.invalid_args} (\`${e}\`)`)
                }
              }
            }
            settings.welcome_channel = channel
            await writeSettings(guildSettings, settings, msg.channel, 'welcome_channel')
            msg.channel.send(lang.welcome_warning)
          } else {
            return msg.channel.send(lang.invalid_args)
          }
        } else if (msg.content.startsWith(settings.prefix + 'deletemsg ') || msg.content === settings.prefix + 'deletemsg') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const types = {
            guild: 'guild',
            user: 'user',
          }
          let user2
          let mode = types.user
          let link = ''
          if (!args[1]) {
            mode = types.guild
            user2 = msg.guild
          } else if (msg.mentions.users.first()) {
            user2 = msg.mentions.users.first()
          } else if (/\D/gm.test(args[1])) {
            user2 = client.users.find('username', args[1])
          } else if (/\d{18}/.test(args[1])) {
            try {
              user2 = client.users.get(args[1])
            } catch (e) {
              user2 = client.users.find('username', args[1])
            }
          } else {
            user2 = client.users.find('username', args[1])
          }
          if (!user2) return msg.channel.send(lang.invalid_args)
          const id = user2.id
          if (mode === types.guild) {
            link = `${c.data_baseurl}/servers/${id}/messages.log`
            fsp.writeFile(`./data/servers/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8')
          } else if (mode === types.user) {
            link = `${c.data_baseurl}/users/${id}/messages.log`
            fsp.writeFile(`./data/users/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8')
          } else {
            await msg.channel.send(f(lang.error, lang.errors.types_are_not_specified))
            throw new TypeError('Types are not specified or invalid type.')
          }
          const embed = new Discord.RichEmbed()
            .setTitle(lang.dumpmessage)
            .setURL(s.inviteme)
            .setColor([140,190,210])
            .setDescription(f(lang.deleted, link))
          msg.channel.send(embed)
        } else if (msg.content === settings.prefix + 'leave') {
          if (!msg.author.id === '254794124744458241') return msg.channel.send(lang.no_permission)
          await msg.channel.send(':wave:')
          msg.guild.leave()
        } else if (msg.content.startsWith(settings.prefix + 'listemojis ') || msg.content === settings.prefix + 'listemojis') {
          const emojiList = msg.guild.emojis.map(e=>e.toString()).join(' ')
          if (args[1] === 'escape') {
            msg.channel.send(`\`\`\`${emojiList}\`\`\``)
          } else {
            msg.channel.send(`${emojiList}`)
          }
        } else if (msg.content.startsWith(settings.prefix + 'instantban ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          msg.guild.ban(client.users.get(args[1]))
          msg.channel.send(':ok_hand:')
        } else if (msg.content.startsWith(settings.prefix + 'instantkick ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          msg.guild.members.get(args[1]).kick('Instant Kick by BlackListener by ' + msg.author.tag)
          msg.channel.send(':ok_hand:')
        } else if (msg.content.startsWith(settings.prefix + 'blockrole ') || msg.content === settings.prefix + 'blockrole') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          const role = msg.guild.roles.find("name", args[1]) ? msg.guild.roles.find("name", args[1]) : msg.guild.roles.get(args[1]);
          if (!role) return msg.channel.send(lang.notfound_role);
          if (settings.blocked_role.includes(role.id)) {
            let exe = false
            for (let i=0; i<=settings.blocked_role.length; i++) {
              if (settings.blocked_role[i] === role.id) {
                exe = true
                delete settings.blocked_role[i]
              }
            }
            if (!exe) { settings = null; return msg.channel.send(lang.notfound_role) }
            writeSettings(guildSettings, settings, msg.channel, "blocked_role")
          } else {
            settings.blocked_role.push(role.id);
            writeSettings(guildSettings, settings, msg.channel, "blocked_role")
          }
        } else if (msg.content.startsWith(settings.prefix + 'language ') || msg.content === settings.prefix + 'language') {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (!args[1] || args[1] === 'help') {
            const embed = new Discord.RichEmbed()
              .setTitle(lang.langnotsupported)
              .setDescription(lang.availablelang)
              .addField(':flag_jp: Japanese - 日本語', 'ja')
              .addField(':flag_us: English - English', 'en')
            msg.channel.send(embed)
          } else if (args[1] === 'en' || args[1] === 'ja') {
            const set = settings
            set.language = args[1]
            await writeSettings(guildSettings, set, msg.channel, 'language')
          }
        } else if (msg.content.startsWith(settings.prefix + 'eval ')) {
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          if (msg.author.id !== '254794124744458241' || msg.content.includes('token')) return msg.channel.send(lang.udonthaveperm)
          const commandcut = msg.content.substr(`${settings.prefix}eval `.length)
          try {
            const returned = client._eval(commandcut)
            logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${returned}`)
            msg.channel.send(`:ok_hand: (${returned})`)
          } catch (e) {
            logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), result: ${lang.eval_error} (${e})`)
            msg.channel.send(f(lang.eval_error, e))
          }
        } else if (msg.content === settings.prefix + 'reload' || msg.content.startsWith(settings.prefix + 'reload ')) {
          if (msg.author.id !== '254794124744458241') return msg.channel.send(lang.udonthaveperm)
          logger.info(f(lang.issuedadmin, msg.author.tag, msg.content, msg.member.permissions.bitfield))
          logger.info('Reloading!')
          if (args[1] === 'restart') { await msg.channel.send(lang.rebooting); return process.kill(process.pid, 'SIGKILL') }
          msg.channel.send(':ok_hand:')
        } else {
          const sb = []
          const cmd = `${args[0]} ${args[1]}`.replace(' undefined', '')
          for (let i = 0; i < commandList.length; i++) {
            commandList[i].no = levenshtein(`${cmd}`, commandList[i].cmd)
          }
          commandList.sort((a, b) => {
            return a.no - b.no
          })
          for (let i = 0; i < commandList.length; i++) {
            if (commandList[i].no <= 2) {
              sb.push(`・\`${settings.prefix}${commandList[i].cmd}${commandList[i].args}\``)
            }
          }
          msg.channel.send(f(lang.no_command, `${settings.prefix}${cmd}`))
          if (sb.length) {
            msg.channel.send(f(lang.didyoumean, `\n${sb.join('\n')}`))
          }
        }
      } else {
        return msg.channel.send(lang.udonthaveperm)
      }
    } else {
      if (msg.content === `<@${client.user.id}>` || msg.content === `<@!${client.user.id}>` || msg.content === `<@!${client.user.id}>`) return msg.channel.send(f(lang.prefixis, settings.prefix))
    }
  }
  settings = null
})

process.on('SIGINT', () => {
  setTimeout(() => {
    logger.info('Exiting')
    process.exit()
  }, 5000)
  logger.info('Caught INT signal, shutdown.')
  client.destroy()
})

async function writeSettings(settingsFile, wsettings, channel, config, message = true) {
  await util.writeJSON(settingsFile, wsettings)
  if (message) await channel.send(f(lang.setconfig, config))
}

client.on('guildMemberAdd', async (member) => {
  const userFile = `./data/users/${member.user.id}/config.json`
  const serverFile = `./data/servers/${member.guild.id}/config.json`
  await mkdirp(`./data/users/${member.user.id}`)
  await mkdirp(`./data/servers/${member.guild.id}`)
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
    message = message.replace('{rep}', `${userSetting.rep}`)
    message = message.replace('{id}', `${member.user.id}`)
    message = message.replace('{username}', `${member.user.username}`)
    message = message.replace('{tag}', `${member.user.tag}`)
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
    await mkdirp(`./data/users/${msg.author.id}`)
    await mkdirp(`./data/servers/${msg.guild.id}`)
    const editUserMessagesFile = `./data/users/${msg.author.id}/editedMessages.log`
    const editServerMessagesFile = `./data/servers/${msg.guild.id}/editedMessages.log`
    fsp.appendFile(editUserMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`)
    fsp.appendFile(editServerMessagesFile, `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`)
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
  const userFile = `./data/users/${olduser.id}/config.json`
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
  if (userChanged) await fsp.writeFile(userFile, JSON.stringify(user, null, 4), 'utf8')
  if (olduser.username !== newuser.username) user.username_changes.push(`${olduser.username} -> ${newuser.username}`)
})

client.on('guildCreate', () => {
  client.user.setActivity(`${c.prefix}help | ${client.guilds.size} guilds`)
})

try {
  client.login(Buffer.from(Buffer.from(Buffer.from(s.token, 'base64').toString('ascii'), 'base64').toString('ascii'), 'base64').toString('ascii'))
    .catch(logger.error)
} catch (e) {
  logger.error(e)
}

process.on('unhandledRejection', (error) => {
  logger.error(`Caught error: ${error}`)
  logger.error(error.stack)
})

client.on('rateLimit', (info, method) => {
  logger.fatal(`==============================`)
  logger.fatal(`      Got rate limiting!      `)
  logger.fatal(` -> You can't send ANY API Requests, and any request will be denied.`)
  logger.fatal(` Detected rate limit while processing '${method}' method.`)
  logger.fatal(`==============================`)
})
