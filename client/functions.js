const f = require('string-format')
const logger = require('../logger').getLogger('functions', 'green')
const util = require('../util')
const { defaultUser, defaultSettings } = require('../contents')

const functions = {
  ban(msg, lang, user) {
    msg.guild.ban(msg.author)
      .then(() => logger.info(f(lang.autobanned, msg.author.tag, user.id, msg.guild.name, msg.guild.id)))
      .catch(logger.error)
  },
  banMember(lang, member) {
    member.guild.ban(member)
      .then(() => logger.info(f(lang.autobanned, member.user.author.tag, member.id, member.guild.name, member.guild.id)))
      .catch(logger.error)
  },
  getDateTime() {
    const date = new Date()
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    ].join( '/' ) + ' ' + date.toLocaleTimeString()
  },
  async initYAML(userFile, serverFile) {
    await util.initYAML(userFile, defaultUser)
    await util.initYAML(serverFile, defaultSettings)
  },
}

module.exports = functions