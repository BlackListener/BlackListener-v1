const f = require('string-format')
const crypto = require('crypto')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<Text> <Password>',
      ],
    }
    super('encrypt', opts)
  }

  run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (!args[2]) return msg.channel.send(lang.invalid_args)
    const cipher = crypto.createCipher('aes192', args[2])
    cipher.update(args[1], 'utf8', 'hex')
    const encryptedText = cipher.final('hex')
    return msg.channel.send(f(lang.encrypted, args[1], args[2], encryptedText))
  }
}
