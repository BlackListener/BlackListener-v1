const config = require('./config.yml')

module.exports = {
  defaultSettings: {
    prefix: config.prefix,
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
  },
}
