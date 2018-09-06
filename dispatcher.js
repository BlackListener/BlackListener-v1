const f = require('string-format')
const logger = require('./logger').getLogger('commands', 'yellow')
const commands = require('./commands')
const levenshtein = require('fast-levenshtein').get
const util = require('./util')
const config = require('./config.yml')

module.exports = async function(settings, msg, lang, guildSettings) {
  if (msg.content === `<@${msg.client.user.id}>` || msg.content === `<@!${msg.client.user.id}>`)
    return msg.channel.send(f(lang.prefixis, settings.prefix))
  if (msg.content.startsWith(settings.prefix)) {
    const [cmd] = msg.content.replace(settings.prefix, '').split(' ')
    if (settings.banned) return msg.channel.send(f(lang.error, lang.errors.server_banned))
    if (commands[cmd]) {
      if (!commands[cmd].isAllowed || commands[cmd].isAllowed(msg, config.owners)) {
        logger.info(f(lang.issuedcmd, msg.author.tag, msg.content))
        commands[cmd](msg, settings, lang, guildSettings)
      } else msg.channel.send(lang.udonthaveperm)
    } else if (await util.exists(`./plugins/commands/${cmd}.js`)) {
      require(`./plugins/commands/${cmd}.js`).run(msg, settings, lang, guildSettings)
    } else {
      const commandList = Object.keys(commands).map(cmd => ({ cmd }))
      for (const item of commandList) item.no = levenshtein(cmd, item.cmd)
      const cmds = commandList.sort((a, b) => a.no - b.no).filter(item => item.no <= 2)
      const list = cmds.map(item => `・\`${settings.prefix}${item.cmd}${item.args || ''}\``)
      msg.channel.send(f(lang.no_command, settings.prefix, cmd))
      if (list.length) msg.channel.send(f(lang.didyoumean, list.join('\n')))
    }
  }
}
