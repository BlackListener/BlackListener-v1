const fs = require('fs').promises
const moment = require('moment')

const getDateTime = () => moment().format('YYYY/MM/DD HH:mm:ss')
const path = {
  userMessages: authorID => `${__dirname}/../data/users/${authorID}/messages.log`,
  serverMessages: guildID => `${__dirname}/../data/servers/${guildID}/messages.log`,
  editUserMessages: authorID => `${__dirname}/../data/users/${authorID}/editedMessages.log`,
  editServerMessages: guildID => `${__dirname}/../data/servers/${guildID}/editedMessages.log`,
}

module.exports = {
  messageLog(msg) {
    const parentName = msg.channel.parent ? msg.channel.parent.name : ''
    const log = `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}`
    fs.appendFile(path.userMessages(msg.author.id), log)
    fs.appendFile(path.serverMessages(msg.guild.id), log)
  },
  editedLog(old, msg) {
    const parentName = msg.channel.parent ? msg.channel.parent.name : ''
    const log = `[${getDateTime()}::${msg.guild.name}:${parentName}:${msg.channel.name}:${msg.channel.id}:${msg.author.tag}:${msg.author.id}] ${msg.content}\n----------\n${old.content}\n----------\n----------\n`
    fs.appendFile(path.editUserMessages(msg.author.id), log)
    fs.appendFile(path.editServerMessages(msg.guild.id), log)
  },
}
