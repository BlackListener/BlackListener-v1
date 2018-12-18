const logger = require(__dirname + '/../logger').getLogger('commands:eval', 'lightpurple')
const f = require('string-format')
const { Command } = require('../core')
const Thread = require('thread')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: ['<Code>'],
    }
    super('eval', opts)
  }

  isAllowed(msg, owners) {
    return owners.includes(msg.author.id)
  }

  async run(msg, settings, lang, args) {
    if (msg.content.includes('token')) return msg.channel.send(lang.udonthaveperm)
    const message = {
      content: msg.content,
      author: {
        id: msg.author.id,
        bot: msg.author.bot,
        avatar: msg.author.avatar,
        avatarURL: msg.author.avatarURL,
        createdAt: msg.author.createdAt,
        createdTimestamp: msg.author.createdTimestamp,
        defaultAvatarURL: msg.author.defaultAvatarURL,
        discriminator: msg.author.discriminator,
        displayAvatarURL: msg.author.displayAvatarURL,
        dmChannel: msg.author.dmChannel,
        lastMessageID: msg.author.lastMessageID,
        presence: msg.author.presence,
        tag: msg.author.tag,
        username: msg.author.username,
      },
    }
    new Thread(async (msg, settings, lang, args) => {
      if (args[1].includes('async:')) {
        args[1] = args[1].replace(/async:/g, '')
        return await eval(`(async () => {${args.slice(1).join(' ')}})()`)
      } else return await eval(args.slice(1).join(' '))
    })
      .on('resolved', data => {
        logger.info(`Eval by ${msg.author.tag} (${msg.author.id}), Result: ${data}`)
        msg.channel.send(`:ok_hand: (${data})`)
      })
      .on('rejected', e => {
        logger.info(`Eval[failed] by ${msg.author.tag} (${msg.author.id}), Result: ${e.error}`)
        msg.channel.send(f(lang.eval_error, e.error))
      })
      .start(message, settings, lang, args)
      .catch(e => {
        logger.info(`Eval[failed] by ${msg.author.tag} (${msg.author.id}), Result: ${e.error}`)
        msg.channel.send(f(lang.eval_error, e.error))
      })
  }
}
