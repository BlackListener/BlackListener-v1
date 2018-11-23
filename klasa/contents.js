module.exports = {
  defaultServer: {
    prefix: '!',
    language: 'en-US',
    /*
    notifyRep: config.notifyRep,
    banRep: config.banRep,
    */
    banned: false,
    disable_purge: true,
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
    'en-US',
    'ja-JP',
  ],
}
