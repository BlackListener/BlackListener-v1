const f = require('string-format')
const git = require('simple-git/promise')()

module.exports.name = 'git'

module.exports.run = async function(msg, settings, lang) {
  const hash = await git.revparse(['HEAD'])
  msg.channel.send(f(lang.commit, hash))
}
