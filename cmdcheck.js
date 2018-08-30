const f = require('string-format')
const logger = require('./logger').getLogger('commands', 'yellow')
const commands = require('./commands/index')
const levenshtein = require('fast-levenshtein').get
const {commandList} = require('./contents')
const util = require('./util')

module.exports = async function(settings, msg, lang, guildSettings) {
  const client = msg.client
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const cmd = args[0]
  if (msg.content.startsWith(settings.prefix)) {
    if (settings.banned && msg.author.id !== '254794124744458241') { settings = null; return msg.channel.send(f(lang.error, lang.errors.server_banned)) }
    if (cmd === 'image') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['image'](msg, settings, lang)
    } else if (msg.content === settings.prefix + 'info') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['info'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'encode ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['encode'](msg, settings)
    } else if (msg.content.startsWith(settings.prefix + 'decode ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['decode'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'encrypt ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['encrypt'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'decrypt ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['decrypt'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'didyouknow ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['didyouknow'](msg, settings, lang)
    } else if (msg.content === settings.prefix + 'members') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['members'](msg, settings)
    } else if (util.cmdcheck(cmd, 'play', 'music')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['play'](msg, settings, lang)
    } else if (util.cmdcheck(cmd, 'releases')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['releases'](msg, settings, lang)
    } else if (util.cmdcheck(cmd, 'help')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['help'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'lookup ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['lookup'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'role ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['role'](msg, settings, lang)
    } else if (util.cmdcheck(cmd, 'listemojis')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['listemojis'](msg, settings)
    } else if (msg.content === settings.prefix + 'serverinfo') {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['serverinfo'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'status ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['status'](msg, settings, lang)
    } else if (msg.content.startsWith(settings.prefix + 'talkja ')) {
      logger.info(f(lang.issueduser, msg.author.tag, msg.content))
      return commands['talkja'](msg, settings, lang)
    } else if (msg.content === settings.prefix + 'invite') {
      logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
      return commands['invite'](msg, settings, lang)
    }
    if (msg.member.hasPermission(8) || msg.author == '<@254794124744458241>') {
      if (util.cmdcheck(cmd, 'togglepurge')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['togglepurge'](msg, settings, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'shutdown')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['shutdown'](msg, settings, lang)
      } else if (msg.content.startsWith(settings.prefix + 'setignore ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setignore'](msg, settings, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setlog ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setlog'](msg, settings, lang, guildSettings)
      } else if (msg.content === settings.prefix + 'token') {
        return commands['token'](msg, settings, lang)
      } else if (util.cmdcheck(cmd, 'ban')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['ban'](msg, settings, lang)
      } else if (util.cmdcheck(cmd, 'purge')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['purge'](msg, settings, lang)
      } else if (msg.content.startsWith(settings.prefix + 'unban ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['unban'](msg, settings, lang)
      } else if (msg.content.startsWith(settings.prefix + 'mute')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['mute'](msg, settings, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setprefix ') || msg.content.startsWith(settings.prefix + 'prefix ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setprefix'](msg, settings, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setnick ') || msg.content.startsWith(settings.prefix + 'setnickname ') || util.cmdcheck(cmd, 'resetnick')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setnick'](msg, settings, lang)
      } else if (msg.content.startsWith(settings.prefix + 'setnotifyrep ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setnotifyrep'](msg, settings, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'setbanrep ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setbanrep'](msg, settings, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'antispam')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['antispam'](msg, settings, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'autorole')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['autorole'](msg, settings, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'dump')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['dump'](msg, settings, lang)
      } else if (msg.content.startsWith(settings.prefix + 'setwelcome ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['setwelcome'](msg, settings, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'deletemsg')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['deletemsg'](msg, settings, lang)
      } else if (msg.content === settings.prefix + 'leave') {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['leave'](msg, settings, lang)
      } else if (msg.content.startsWith(settings.prefix + 'instantban ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['instantban'](msg, settings)
      } else if (msg.content.startsWith(settings.prefix + 'instantkick ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['instantkick'](msg, settings)
      } else if (util.cmdcheck(cmd, 'blockrole')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['blockrole'](msg, settings, lang, guildSettings)
      } else if (util.cmdcheck(cmd, 'language')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['language'](msg, settings, lang, guildSettings)
      } else if (msg.content.startsWith(settings.prefix + 'eval ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['eval'](msg, settings, lang)
      } else if (msg.content === settings.prefix + 'reload' || msg.content.startsWith(settings.prefix + 'reload ')) {
        logger.info(f(lang.issuedadmin, msg.author.tag, msg.content))
        return commands['reload'](msg, settings, lang)
      } else {
        if (await commands.exists(args[0])) {
          commands.run(args[0], settings, msg, lang, guildSettings)
        } else {
          const sb = []
          const cmd = `${args[0]} ${args[1]}`.replace(' undefined', '')
          for (let i = 0; i < commandList.length; i++) {
            commandList[i].no = levenshtein(`${args[0]}`, commandList[i].cmd)
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
      msg.channel.send(lang.udonthaveperm)
    }
  } else {
    if (msg.content === `<@${client.user.id}>` || msg.content === `<@!${client.user.id}>` || msg.content === `<@!${client.user.id}>`)
      msg.channel.send(f(lang.prefixis, settings.prefix))
  }
}
