const { Client } = require('klasa')

/**
 * The following are all client options for Klasa/Discord.js.
 * Any option that you wish to use the default value can be removed from this file.
 * This file is init with defaults from both Klasa and Discord.js.
 */

exports.config = {
  /**
   * General Options
   */
  // Disables/Enables a process.on('unhandledRejection'...) handler
  production: false,
  // The default language that comes with klasa. More base languages can be found on Klasa-Pieces
  language: 'en-US',
  // The default configurable prefix for each guild
  prefix: '!',
  // If custom settings should be preserved when a guild removes your bot
  preserveSettings: true,
  // If your bot should be able to mention @everyone
  disableEveryone: false,
  // Whether d.js should queue your rest request in 'sequential' or 'burst' mode
  apiRequestMethod: 'sequential',
  // The time in ms to add to ratelimits, to ensure you wont hit a 429 response
  restTimeOffset: 500,
  // Any Websocket Events you don't want to listen to
  disabledEvents: [],
  // A presence to login with
  presence: {},
  // A once ready message for your console
  readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.size} guild${client.guilds.size === 1 ? '' : 's'}.`,

  /**
   * Caching Options
   */
  fetchAllMembers: false,
  messageCacheMaxSize: 200,
  messageCacheLifetime: 0,
  commandMessageLifetime: 1800,
  // The above 2 options are ignored while the interval is 0
  messageSweepInterval: 0,

  /**
   * Sharding Options
   */
  shardId: 0,
  shardCount: 1,

  /**
   * Command Handler Options
   */
  commandEditing: false,
  commandLogging: false,
  typing: false,

  /**
   * Database Options
   */
  providers: {
    /*
      // Provider Connection object for process based databases:
      // rethinkdb, mongodb, mssql, mysql, postgresql
      mysql: {
        host: 'localhost',
        db: 'klasa',
        user: 'database-user',
        password: 'database-password',
        options: {}
      },
    */
    default: 'json',
  },

  /**
   * Custom Prompt Defaults
   */
  customPromptDefaults: {
    time: 30000,
    limit: Infinity,
    quotedStringSupport: false,
  },

  /**
   * Klasa Piece Defaults
   */
  pieceDefaults: {
    commands: {
      aliases: [],
      autoAliases: true,
      bucket: 1,
      cooldown: 0,
      description: '',
      enabled: true,
      guarded: false,
      nsfw: false,
      permissionLevel: 0,
      promptLimit: 0,
      promptTime: 30000,
      requiredSettings: [],
      requiredPermissions: 0,
      runIn: ['text', 'dm', 'group'],
      subcommands: false,
      usage: '',
      quotedStringSupport: false,
      deletable: false,
    },
    events: {
      enabled: true,
      once: false,
    },
    extendables: {
      enabled: true,
      klasa: false,
      appliesTo: [],
    },
    finalizers: { enabled: true },
    inhibitors: {
      enabled: true,
      spamProtection: false,
    },
    languages: { enabled: true },
    monitors: {
      enabled: true,
      ignoreBots: true,
      ignoreSelf: true,
      ignoreOthers: true,
      ignoreWebhooks: true,
      ignoreEdits: true,
    },
    providers: {
      enabled: true,
      sql: false,
      cache: false,
    },
    tasks: { enabled: true },
  },

  /**
   * Console Event Handlers (enabled/disabled)
   */
  consoleEvents: {
    debug: false,
    error: true,
    log: true,
    verbose: false,
    warn: true,
    wtf: true,
  },

  /**
   * Console Options
   */
  console: {
    // Alternatively a Moment Timestamp string can be provided to customize the timestamps.
    timestamps: true,
    utc: false,
    colors: {
      debug: { time: { background: 'magenta' } },
      error: { time: { background: 'red' } },
      log: { time: { background: 'blue' } },
      verbose: { time: { text: 'gray' } },
      warn: { time: { background: 'lightyellow', text: 'black' } },
      wtf: { message: { text: 'red' }, time: { background: 'red' } },
    },
  },

  /**
   * Custom Setting Gateway Options
   */
  gateways: {
    guilds: {
      schema: Client.defaultGuildSchema
        // .add('prefix', 'any', { default: '!' })
        // .add('language', 'any', { default: 'en-US' })
        .add('notifyRep', 'any', { default: 1 })
        .add('banRep', 'any', { default: 5 })
        .add('banned', 'any', { default: false })
        .add('disable_purge', 'any', { default: true })
        .add('autorole', 'any', { default: null })
        .add('excludeLogging', 'any', { default: '' })
        .add('invite', 'any', { default: false })
        .add('welcome_channel', 'any', { default: null })
        .add('welcome_message', 'any', { default: null })
        .add('mute', 'any', { array: true })
        .add('message_blacklist', 'any', { array: true })
        .add('blocked_role', 'any', { array: true })
        .add('log_channel', 'any', { default: '' }),
    },
    users: {
      schema: Client.defaultUserSchema
        .add('rep', 'any', { default: 0 })
        .add('bannedFromServer', 'any', { array: true })
        .add('bannedFromServerOwner', 'any', { array: true })
        .add('bannedFromUser', 'any', { array: true })
        .add('probes', 'any', { array: true })
        .add('reasons', 'any', { array: true })
        .add('username_changes', 'any', { array: true })
        .add('tag', 'any', { default: '' }),
    },
    clientStorage: {
      schema: Client.defaultClientSchema
        .add('bans', 'any', { array: true }),
    },
  },

  /**
   * Klasa Schedule Options
   */
  schedule: { interval: 60000 },

  permissionLevels: Client.defaultPermissionLevels
    .add(5, ({ guild, member }) => guild && member.permissions.has('ADMINISTRATOR'), { fetch: true }),
}
