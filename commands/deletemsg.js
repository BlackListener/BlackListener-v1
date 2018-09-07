const fs = require('fs').promises
const Discord = require('discord.js')
const f = require('string-format')
const config = require('../config.yml')

module.exports.args = '[User]'

module.exports.name = 'deletemsg'

module.exports.isAllowed = msg => {
  return msg.member.hasPermission(8)
}

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const client = msg.client
  const types = {
    guild: 'guild',
    user: 'user',
  }
  let user2
  let mode = types.user
  let link = ''
  if (!args[1]) {
    mode = types.guild
    user2 = msg.guild
  } else if (msg.mentions.users.first()) {
    user2 = msg.mentions.users.first()
  } else if (/\D/gm.test(args[1])) {
    user2 = client.users.find(n => n.username === args[1])
  } else if (/\d{18}/.test(args[1])) {
    user2 = client.users.get(args[1]) || client.users.find(n => n.username === args[1])
  } else {
    user2 = client.users.find(n => n.username === args[1])
  }
  if (!user2) return msg.channel.send(lang.invalid_args)
  const id = user2.id
  if (mode === types.guild) {
    link = `${config.data_baseurl}/servers/${id}/messages.log`
    fs.writeFile(`./data/servers/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8')
  } else if (mode === types.user) {
    link = `${config.data_baseurl}/users/${id}/messages.log`
    fs.writeFile(`./data/users/${id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8')
  } else {
    await msg.channel.send(f(lang.error, lang.errors.types_are_not_specified))
    throw new TypeError('Types are not specified or invalid type.')
  }
  const embed = new Discord.RichEmbed()
    .setTitle(lang.dumpmessage)
    .setColor([140,190,210])
    .setDescription(f(lang.deleted, link))
  msg.channel.send(embed)
}
