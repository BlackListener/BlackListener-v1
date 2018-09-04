const f = require('string-format')

module.exports.name = 'token'

module.exports.isAllowed = msg => {
  return msg.author.id == '254794124744458241'
}

module.exports.run = function(msg, settings, lang) {
  msg.author.send(f(lang.mytoken, msg.client.token))
  msg.reply(lang.senttodm)
  msg.delete(5000)
}
