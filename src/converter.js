const client = require(__dirname + '/client')
const Discord = require('discord.js') // eslint-disable-line

/**
 * Converts UserResolvable(without Guild Owner, Message Author) to User.
 * Resolve by UserID, Username, Mention
 * @example toUser(msg, args[1])
 * @param {?Discord.Message} msg
 * @param {Discord.UserResolvable} before
 * @returns {?Discord.User} A resolved User, if not resolved, returns empty JSON({})
 */
const toUser = (msg = null, before) => {
  return client.users.get(before) || client.users.find(u => u.username === before) || msg ? msg.mentions.users.first() : {}
}

/**
 * Converts UserResolvable(without Guild Owner, Message Author) to User.
 * Resolve by ChannelID, Channel name, Mention
 * @example toChannel(msg, args[1])
 * @param {?Discord.Message} msg
 * @param {Discord.ChannelResolvable} before
 * @returns {?Discord.Channel} A resolved User, if not resolved, returns empty JSON({})
 */
const toChannel = (msg = null, before) => {
  return client.channels.get(before) || client.channels.find(c => c.name === before) || msg ? msg.mentions.channels.first() : {}
}

/**
 * Represents Converter.
 */
module.exports = {
  toUser: toUser,
  toChannel: toChannel,
}
