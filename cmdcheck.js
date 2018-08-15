const f = require('string-format')
const logger = require('./logger').getLogger('commands', 'yellow')
const commands = require('./commands/index')
const levenshtein = require('fast-levenshtein').get
const isWindows = process.platform === 'win32'
const {commandList} = require('./contents')
const c = require('./config.json5')
const util = require('./util')
const s = require('./secret.json5')

module.exports = async function(settings, msg, lang, cmd, args, guildSettings, user, bans) {
  const client = msg.client
  if (msg.content.startsWith(settings.prefix)) {
    if (settings.banned && msg.author.id !== '254794124744458241') { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)) }
    if (cmd === 'image') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['image'](settings, msg, lang)
    } else if (msg.content === settings.prefix + 'info') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['info'](msg, lang, isWindows)
    } else if (msg.content.startsWith(settings.prefix + 'encode ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['encode'](settings, msg)
    } else if (msg.content.startsWith(settings.prefix + 'decode ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['decode'](msg, args[1])
    } else if (msg.content.startsWith(settings.prefix + 'encrypt ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['encrypt'](settings, msg, lang)
    } else if (msg.content.startsWith(settings.prefix + 'decrypt ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['decrypt'](settings, msg, lang)
    } else if (msg.content.startsWith(settings.prefix + 'didyouknow ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['didyouknow'](settings, msg, lang)
    } else if (msg.content === settings.prefix + 'members') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['members'](msg)
    } else if (util.cmdcheck(cmd, 'play', 'music')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['play'](msg, lang)
    } else if (util.cmdcheck(cmd, 'releases')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['releases'](msg, lang)
    } else if (util.cmdcheck(cmd, 'help')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['help'](settings, msg, lang)
    } else if (msg.content.startsWith(settings.prefix + 'lookup ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['lookup'](settings, msg, lang)
    } else if (msg.content.startsWith(settings.prefix + 'role ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['role'](settings, msg, lang)
    } else if (util.cmdcheck(cmd, 'listemojis')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['listemojis'](settings, msg)
    } else if (msg.content === settings.prefix + 'serverinfo') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['serverinfo'](settings, msg, lang)
    } else if (msg.content === settings.prefix + 'status minecraft') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['status minecraft'](msg, lang)
    } else if (msg.content === settings.prefix + 'status fortnite') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['status fortnite'](s, msg, lang)
    } else if (msg.content.startsWith(settings.prefix + 'talkja ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['talkja'](settings, s, msg, lang)
    } else if (msg.content === settings.prefix + 'invite') {
      logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
      return commands['invite'](msg, lang)
    }
    if (msg.member.hasPermission(8) || msg.author == '<@254794124744458241>') {
      if (util.cmdcheck(cmd, 'togglepurge')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['togglepurge'](settings, msg, guildSettings)
      } else if (util.cmdcheck(cmd, 'shutdown')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['shutdown'](settings, msg, lang)
      } else if (msg.content.startsWith(settings.prefix + 'setignore ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setignore'](settings, msg, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setlog ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setlog'](settings, msg, lang, guildSettings)
      } else if (msg.content === settings.prefix + 'token') {
        return commands['token'](msg, lang)
      } else if (util.cmdcheck(cmd, 'ban')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['ban'](settings, msg, lang, user, bans)
      } else if (util.cmdcheck(cmd, 'purge')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['purge'](settings, msg, lang)
      } else if (msg.content.startsWith(settings.prefix + 'unban ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['unban'](settings, msg, lang, bans)
      } else if (msg.content.startsWith(settings.prefix + 'mute')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['mute'](settings, msg, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setprefix ') || msg.content.startsWith(settings.prefix + 'prefix ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setprefix'](settings, msg, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setnick ') || msg.content.startsWith(settings.prefix + 'setnickname ') || util.cmdcheck(cmd, 'resetnick')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setnick'](settings, msg, lang)
      } else if (msg.content.startsWith(settings.prefix + 'setnotifyrep ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setnotifyrep'](settings, msg, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setbanrep ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setbanrep'](settings, msg, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'antispam')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['antispam'](settings, msg, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'autorole')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['autorole'](settings, msg, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'dump')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['dump'](settings, msg, lang, c)
      } else if (msg.content.startsWith(settings.prefix + 'setwelcome ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setwelcome'](settings, msg, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'deletemsg')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['deletemsg'](settings, msg, lang, c)
      } else if (msg.content === settings.prefix + 'leave') {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['leave'](msg, lang)
      } else if (msg.content.startsWith(settings.prefix + 'instantban ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['instantban'](settings, msg)
      } else if (msg.content.startsWith(settings.prefix + 'instantkick ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['instantkick'](settings, msg)
      } else if (util.cmdcheck(cmd, 'blockrole')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['blockrole'](settings, msg, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'language')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['language'](settings, msg, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'eval ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['eval'](settings, msg, lang)
      } else if (msg.content === settings.prefix + 'reload' || msg.content.startsWith(settings.prefix + 'reload ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['reload'](msg, lang)
      } else {
        if (await commands.exists(args[0])) {
          commands.run(args[0], settings, msg, lang, guildSettings, c)
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
      }
    } else {
      return msg.channel.send(lang.udonthaveperm)
    }
  } else {
    if (msg.content === `<@${client.user.id}>` || msg.content === `<@!${client.user.id}>` || msg.content === `<@!${client.user.id}>`) return msg.channel.send(f(lang.prefixis, settings.prefix))
  }
}
