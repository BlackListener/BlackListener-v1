const f = require('string-format')
const crypto = require('crypto')

module.exports.args = ['<EncryptedText> <Password>']

module.exports.name = 'decrypt'

module.exports.run = function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (!args[2]) return msg.channel.send(lang.invalid_args)
  let decipher; let dec
  try {
    decipher = crypto.createDecipher('aes192', args[2])
    decipher.update(args[1], 'hex', 'utf8')
    dec = decipher.final('utf8')
  } catch (e) {
    return msg.channel.send(f(lang.invalid_password, args[2]))
  }
  return msg.channel.send(f(lang.decrypted, args[1], args[2], dec))
}
