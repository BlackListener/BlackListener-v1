const config = require('./config.yml')
const argv = require('./argument_parser')(process.argv.slice(2))

module.exports = {
  defaultServer: {
    prefix: argv.prefix || config.prefix,
    language: config.lang,
    notifyRep: config.notifyRep,
    banRep: config.banRep,
    antispam: true,
    banned: false,
    disable_purge: true,
    ignoredChannels: [],
    autorole: null,
    excludeLogging: '',
    invite: false,
    welcome_channel: null,
    welcome_message: null,
    mute: [],
    message_blacklist: [],
    blocked_role: [],
    log_channel: '',
  },
  defaultBans: [],
  defaultUser: {
    rep: 0,
    bannedFromServer: [],
    bannedFromServerOwner: [],
    bannedFromUser: [],
    probes: [],
    reasons: [],
    username_changes: [],
    tag: '',
  },
  validLanguages: [
    'en',
    'ja',
  ],
}
