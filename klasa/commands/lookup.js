const Discord = require('discord.js')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'lookup',
      usage: '<User:user>',
    })
  }

  async run(msg, [user]) {
    const data = msg.client.providers.get('json')
    const userConfig = await data.get('users', user.id) || {}
    userConfig.tag = user.tag
    userConfig.createdTimestamp = user.createdTimestamp
    userConfig.bot = user.bot
    const bannedFromServer = userConfig && userConfig.bannedFromServer ? userConfig.bannedFromServer.map((server, i) => `${server} (${userConfig.bannedFromServerOwner[i]})`) : [msg.language.get('_sunknown')]
    const usernameChanges = userConfig && userConfig.username_changes ? userConfig.username_changes.filter(e => e) : [msg.language.get('_sunknown')]
    const isBot = userConfig.bot ? msg.language.get('_yes') : msg.language.get('_no')
    const nick = msg.guild.members.has(user.id) ? msg.guild.members.get(user.id).nickname : msg.language.get('_nul')
    const joinedAt = msg.guild.members.has(user.id) && msg.guild.members.get(user.id).joinedAt ? msg.guild.members.get(user.id).joinedAt.toLocaleString() : msg.language.get('_sunknown')
    const embed = new Discord.MessageEmbed()
      .setTitle(msg.language.get('COMMAND_LOOKUP_TITLE'))
      .setColor([0,255,0])
      .setThumbnail(user.avatarURL)
      .addField(msg.language.get('COMMAND_LOOKUP_REP'), userConfig.rep || 0)
      .addField(msg.language.get('COMMAND_LOOKUP_BANNEDFROMSERVER'), bannedFromServer.join('\n') || msg.language.get('COMMAND_LOOKUP_NOT_BANNED'))
      .addField(msg.language.get('COMMAND_LOOKUP_BANNEDFROMUSER'), (userConfig.bannedFromUser && userConfig.bannedFromUser.join('\n')) || msg.language.get('COMMAND_LOOKUP_NOT_BANNED'))
      .addField(msg.language.get('COMMAND_LOOKUP_PROBES'), (userConfig.probes && userConfig.probes.join('\n')) || msg.language.get('COMMAND_LOOKUP_NOT_BANNED'))
      .addField(msg.language.get('COMMAND_LOOKUP_REASONS'), (userConfig.reasons && userConfig.reasons.join('\n')) || msg.language.get('COMMAND_LOOKUP_NOT_BANNED'))
      .addField(msg.language.get('COMMAND_LOOKUP_TAG'), user.tag)
      .addField(msg.language.get('COMMAND_LOOKUP_NICKNAME'), nick)
      .addField(msg.language.get('COMMAND_LOOKUP_ID'), user.id)
      .addField(msg.language.get('COMMAND_LOOKUP_USERNAME_CHANGES'), usernameChanges.join('\n') || msg.language.get('_no'))
      .addField(msg.language.get('COMMAND_LOOKUP_BOT'), isBot)
      .addField(msg.language.get('COMMAND_LOOKUP_CREATEDAT'), user && user.createdAt ? user.createdAt.toLocaleString() : msg.language.get('_sunknown'))
      .addField(msg.language.get('COMMAND_LOOKUP_JOINEDAT'), joinedAt)
      .addField(msg.language.get('COMMAND_LOOKUP_NOWTIME'), new Date().toLocaleString())
    msg.channel.send(embed)
  }
}
