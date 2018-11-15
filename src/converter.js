const client = require(__dirname + '/client')
const Discord = require('discord.js')

/**
 * Represents Converter.
 */
class Converter {
  /**
   * Data that converts to give a User object. This can be:
   * * A Snowflake
   * * A User name
   * @typedef {Discord.Snowflake|String} UserConvertible
   */

  /**
   * Converts a UserConvertible to a User object.
   * @example toUser(msg, args[1])
   * @param {Discord.Message} msg
   * @param {UserConvertible} user
   * @param {?Discord.User} fallback The User of fallback
   * @returns {?Discord.User}
   */
  static toUser(msg, user, fallback) {
    if (msg.mentions.users.size) return msg.mentions.users.first()
    if (client.users.has(user)) return client.users.get(user)
    if (client.users.find(u => u.username === user)) return client.users.find(u => u.username === user)
    if (fallback) return fallback
    return null
  }

  /**
   * Data that converts to give a Member object. This can be:
   * * A Snowflake
   * * A Member name
   * @typedef {Discord.Snowflake|String} MemberConvertible
   */

  /**
   * Converts a MemberConvertible to a Member object.
   * @example toMember(msg, args[1])
   * @param {Discord.Message} msg
   * @param {MemberConvertible} member
   * @param {?Discord.GuildMember} fallback The Member of fallback
   * @returns {?Discord.GuildMember}
   */
  static toMember(msg, member, fallback) {
    if (!msg.guild) return null
    if (msg.mentions.members.size) return msg.mentions.members.first()
    if (msg.guild.members.has(member)) return client.members.get(member)
    if (msg.guild.members.find(u => u.username === member)) return client.members.find(u => u.username === member)
    if (fallback) return fallback
    return null
  }

  /**
   * Data that converts to give a Role object. This can be:
   * * A Snowflake
   * * A Role name
   * @typedef {Discord.Snowflake|String} RoleConvertible
   */

  /**
   * Converts a RoleConvertible to a Role object.
   * @example toRole(msg, args[1])
   * @param {Discord.Message} msg
   * @param {RoleConvertible} member
   * @param {?Discord.Role} fallback The Role of fallback.
   * @returns {?Discord.Role}
   */
  static toRole(msg, member, fallback) {
    if (!msg.guild) return null
    if (msg.mentions.roles.size) return msg.mentions.roles.first()
    if (msg.guild.roles.has(member)) return client.roles.get(member)
    if (msg.guild.roles.find(r => r.username === member)) return client.roles.find(r => r.username === member)
    if (fallback) return fallback
    return null
  }

  /**
   * Data that converts to give a Channel object. This can be:
   * * A Snowflake
   * * A Channel name
   * @typedef {Discord.Snowflake|String} ChannelConvertible
   */

  /**
    * Converts a ChannelConvertible to a Channel object.
    * @example toChannel(msg, args[1])
    * @param {Discord.Message} msg
    * @param {ChannelConvertible} channel
    * @param {?Discord.Channel} fallback The Channel of fallback
    * @returns {?Discord.Channel}
    */
  static toChannel(msg, channel, fallback) {
    if (msg.mentions.channels.size) return msg.mentions.channels.first()
    if (msg.guild.channels.has(channel)) return client.channels.get(channel)
    if (msg.guild.channels.find(c => c.name === channel)) return client.channels.find(c => c.name === channel)
    if (fallback) return fallback
    return null
  }

  /**
    * Converts a ChannelConvertible to a Channel object.
    * @example toChannel(msg, args[1])
    * @param {Discord.Message} msg
    * @param {ChannelConvertible} channel
    * @param {?Discord.GuildChannel} fallback The Channel of fallback
    * @returns {?Discord.GuildChannel}
    */
  static toGuildChannel(msg, channel, fallback) {
    if (!msg.guild) return null
    const _channel = this.toChannel(msg, channel, fallback)
    if (!_channel || !msg.guild.channels.has(_channel.id)) return null
    return _channel
  }

  /**
    * Converts a ChannelConvertible to a TextChannel object.
    * @example toChannel(msg, args[1])
    * @param {Discord.Message} msg
    * @param {ChannelConvertible} channel
    * @param {?Discord.TextChannel} fallback The TextChannel of fallback
    * @returns {?Discord.TextChannel}
    */
  static toTextChannel(msg, channel, fallback) {
    const _channel = this.toGuildChannel(msg, channel, fallback)
    if (_channel instanceof Discord.TextChannel) return _channel
    return null
  }

  /**
    * Converts a ChannelConvertible to a VoiceChannel object.
    * @example toChannel(msg, args[1])
    * @param {Discord.Message} msg
    * @param {ChannelConvertible} channel
    * @param {?Discord.VoiceChannel} fallback The VoiceChannel of fallback
    * @returns {?Discord.VoiceChannel}
    */
  static toVoiceChannel(msg, channel, fallback) {
    const _channel = this.toGuildChannel(msg, channel, fallback)
    if (_channel instanceof Discord.VoiceChannel) return _channel
    return null
  }

}

module.exports = Converter
