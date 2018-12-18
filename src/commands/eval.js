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
    const client = {
      ping: msg.client.ping,
      pings: msg.client.pings,
      readyAt: msg.client.readyAt,
      readyTimestamp: msg.client.readyTimestamp,
      status: msg.client.status,
      uptime: msg.client.uptime,
      options: msg.client.options,
    }
    const message = {
      client: client,
      content: msg.content,
      author: {
        client: client,
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
      hit: msg.hit,
      member: {
        id: msg.member.id,
        client: client,
        deaf: msg.member.deaf,
        bannable: msg.member.bannable,
        deleted: msg.member.deleted,
        displayColor: msg.member.displayColor,
        displayHexColor: msg.member.displayHexColor,
        displayName: msg.member.displayName,
        joinedAt: msg.member.joinedAt,
        joinedTimestamp: msg.member.joinedTimestamp,
        kickable: msg.member.kickable,
        lastMessageID: msg.member.lastMessageID,
        manageable: msg.member.manageable,
        mute: msg.member.mute,
        nickname: msg.member.nickname,
      },
      embed: {
        author: msg.embed.author,
        color: msg.embed.color,
        createdAt: msg.embed.createdAt,
        description: msg.embed.description,
        hexColor: msg.embed.hexColor,
        footer: {
          iconURL: msg.embed.footer.iconURL,
          proxyIconUrl: msg.embed.footer.proxyIconUrl,
          text: msg.embed.footer.text,
        },
        image: {
          height: msg.embed.image.height,
          proxyURL: msg.embed.image.proxyURL,
          url: msg.embed.image.url,
          width: msg.embed.image.width,
        },
        timestamp: msg.embed.timestamp,
        title: msg.embed.title,
        type: msg.embed.type,
        url: msg.embed.url,
      },
      nonce: msg.nonce,
      id: msg.id,
      pinnable: msg.pinnable,
      pinned: msg.pinned,
      system: msg.system,
      tts: msg.tts,
      type: msg.type,
      url: msg.url,
      webhookID: msg.webhookID,
      cleanContent: msg.cleanContent,
      createdAt: msg.createdAt,
      createdTimestamp: msg.createdTimestamp,
      deletable: msg.deletable,
      deleted: msg.deleted,
      editable: msg.editable,
      editedAt: msg.editedAt,
      editedTimestamp: msg.editedTimestamp,
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
