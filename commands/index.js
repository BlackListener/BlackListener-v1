const test = process.argv[2] === '--test'
const util = require('../util')
const logger = require('../logger').getLogger('plugins', 'cyan')
let commands = {}
try {
  commands = {
    'help': require('./help'),
    'lookup': require('./lookup'),
    'role': require('./role'),
    'serverinfo': require('./serverinfo'),
    'status': require('./status'),
    'talkja': require('./talkja'),
    'togglepurge': require('./togglepurge'),
    'shutdown': require('./shutdown'),
    'setignore': require('./setignore'),
    'setlog': require('./setlog'),
    'token': require('./token'),
    'ban': require('./ban'),
    'purge': require('./purge'),
    'unban': require('./unban'),
    'mute': require('./mute'),
    'setprefix': require('./setprefix'),
    'setnick': require('./setnick'),
    'setnotifyrep': require('./setnotifyrep'),
    'setbanrep': require('./setbanrep'),
    'antispam': require('./antispam'),
    'autorole': require('./autorole'),
    'dump': require('./dump'),
    'setwelcome': require('./setwelcome'),
    'deletemsg': require('./deletemsg'),
    'leave': require('./leave'),
    'instantban': require('./instantban'),
    'instantkick': require('./instantkick'),
    'blockrole': require('./blockrole'),
    'language': require('./language'),
    'eval': require('./eval'),
    'reload': require('./reload'),
    'play': require('./play'),
    'releases': require('./releases'),
    'members': require('./members'),
    'didyouknow': require('./didyouknow'),
    'decrypt': require('./decrypt'),
    'encrypt': require('./encrypt'),
    'decode': require('./decode'),
    'encode': require('./encode'),
    'image': require('./image'),
    'info': require('./info'),
    'invite': require('./invite'),
    async exists(cmd) {
      logger.debug(`Checking ../plugins/commands/${cmd}.js`)
      return await util.exists(`./plugins/commands/${cmd}.js`)
    },
    async run(cmd, settings, msg, lang, guildSettings) {
      if (await util.exists(`./plugins/commands/${cmd}.js`)) {
        logger.debug(`Loading plugin: commands/${cmd}.js`)
        return require(`../plugins/commands/${cmd}.js`)(settings, msg, lang, guildSettings)
      }
    },
  }
} catch (e) {
  logger.fatal(`Oh, something went wrong: ${e}`)
    .fatal(e.stack)
  process.exit(1)
}

if (test) {
  (async function() {
    logger.info('--- T E S T S ---')
    logger.warn('You are using incomplete feature.')
    logger.warn('Some commands are cannot test.')
    const lang = require('../lang/en.json')
    const { defaultSettings } = require('../contents')
    const fakeclient = {
      _eval() { return true },
      'users': {
        find() { return 'unknown' },
      },
    }
    const testmsg = {
      'client': fakeclient,
      'channel': {
        send() {
          return true
        },
      },
      'mentions': {
        'channels': [],
        'users': {
          first() {
            return 'TNT'
          },
        },
      },
      'content': '<prefix>help help help help help help help help me',
      'author': {
        'id': '254794124744458241',
        send() {
          return true
        },
      },
      reply() {
        return true
      },
      async delete() {
        Promise.resolve()
      },
      'guild': {
        leave() { return true },
      },
    }
    const tests = {}
    if (commands.help(defaultSettings, testmsg, lang)) tests.help = true
    if (commands.encode(defaultSettings, testmsg)) tests.encode = true
    if (commands.decode(testmsg, 'c29tZSBzdHJpbmc=')) tests.decode = true
    if (commands.didyouknow(defaultSettings, testmsg, lang)) tests.didyouknow = true
    if (commands.eval(defaultSettings, testmsg, lang)) tests.eval = true
    if (commands.releases(defaultSettings, testmsg, lang)) tests.releases = true
    if (commands.token(testmsg, lang)) tests.token = true
    if (commands.togglepurge(defaultSettings, testmsg, '460812821412708353')) tests.togglepurge = true
    if (await commands.play(testmsg, lang)) tests.play = true
    if (await commands.leave(testmsg, lang)) tests.leave = true
    let success = 0; let fails = 0
    const total = Object.keys(tests).length
    for (let i=0;i<total;++i) {
      if (Object.values(tests)[i]) { success++ } else { fails++ }
    }
    logger.info(`Test: Total: ${total} Success: ${success}, Fails: ${fails}`)
  }) ()
}

module.exports = commands
