const autorole = require('./components/settings/autorole')
const banRep = require('./components/settings/banRep')
const notifyRep = require('./components/settings/notifyRep')
const prefix = require('./components/settings/prefix')
const welcome_message = require('./components/settings/welcome_message')
const log_channel = require('./components/settings/log_channel')
const disable_purge = require('./components/settings/disable_purge')
const excludeLogging = require('./components/settings/excludeLogging')
const language = require('./components/settings/language')
const mute = require('./components/settings/mute')

const language_user = require('./components/user_settings/language')

const update = require('./components/update')

module.exports = {
  settings: {
    autorole,
    banRep,
    notifyRep,
    prefix,
    welcome_message,
    log_channel,
    disable_purge,
    excludeLogging,
    language,
    mute,
  },
  user_settings: {
    language: language_user,
  },
  update,
}
