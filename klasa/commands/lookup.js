const Converter = require(__dirname + '/../converter.js')
const Discord = require('discord.js')
const data = require(__dirname + '/../data')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<User>',
      ],
    }
    super('lookup', opts)
  }

  async run(msg, settings, lang, args) {
    if (!args[1]) return msg.channel.send(lang._no_args)
    const arg = args.slice(1).join(' ')
    const client = msg.client
    let user = Converter.toUser(msg, arg)
    if (!user) user = await client.fetchUser(arg, false).catch(() => null)
    if (!user) return msg.channel.send(lang._invalid_args)
    const userConfig = await data.user(user.id)
    userConfig.tag = user.tag
    userConfig.createdTimestamp = user.createdTimestamp
    userConfig.bot = user.bot
    const bannedFromServer = userConfig && userConfig.bannedFromServer ? userConfig.bannedFromServer.map((server, i) => `${server} (${userConfig.bannedFromServerOwner[i]})`) : [lang._sunknown]
    const usernameChanges = userConfig && userConfig.username_changes ? userConfig.username_changes.filter(e => e) : [lang._sunknown]
    const isBot = userConfig.bot ? lang._yes : lang._no
    const nick = (user && msg.guild.members.has(user.id)) ? msg.guild.members.get(user.id).nickname : lang._nul
    const joinedAt = user && msg.guild.members.has(user.id) && msg.guild.members.has(user.id).joinedAt ? msg.guild.members.get(user.id).joinedAt.toLocaleString() : lang._sunknown
    const embed = new Discord.MessageEmbed()
      .setTitle(lang.COMMAND_LOOKUP_TITLE)
      .setColor([0,255,0])
      .setThumbnail(user.avatarURL)
      .addField(lang.COMMAND_LOOKUP_REP, userConfig.rep)
      .addField(lang.COMMAND_LOOKUP_BANNEDFROMSERVER, bannedFromServer.join('\n') || lang.COMMAND_LOOKUP_NOT_BANNED)
      .addField(lang.COMMAND_LOOKUP_BANNEDFROMUSER, userConfig.bannedFromUser.join('\n') || lang.COMMAND_LOOKUP_NOT_BANNED)
      .addField(lang.COMMAND_LOOKUP_PROBES, userConfig.probes.join('\n') || lang.COMMAND_LOOKUP_NOT_BANNED)
      .addField(lang.COMMAND_LOOKUP_REASONS, userConfig.reasons.join('\n') || lang.COMMAND_LOOKUP_NOT_BANNED)
      .addField(lang.COMMAND_LOOKUP_TAG, user.tag)
      .addField(lang.COMMAND_LOOKUP_NICKNAME, nick)
      .addField(lang.COMMAND_LOOKUP_ID, user.id)
      .addField(lang.COMMAND_LOOKUP_USERNAME_CHANGES, usernameChanges.join('\n') || lang._no)
      .addField(lang.COMMAND_LOOKUP_BOT, isBot)
      .addField(lang.COMMAND_LOOKUP_CREATEDAT, user && user.createdAt ? user.createdAt.toLocaleString() : lang._sunknown)
      .addField(lang.COMMAND_LOOKUP_JOINEDAT, joinedAt)
      .addField(lang.COMMAND_LOOKUP_NOWTIME, new Date().toLocaleString())
    msg.channel.send(embed)
  }
}
