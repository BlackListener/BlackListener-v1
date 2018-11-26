const Discord = require('discord.js')
const randomPuppy = require('random-puppy')
const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'image',
      usage: '<anime|custom> [subreddit:str]',
    })
  }

  async run(msg, [type, subreddit]) {
    const sendImage = async list => {
      const message = await msg.channel.send(lang.COMMAND_IMAGE_SEARCHING)
      const sub = list[Math.round(Math.random() * (list.length - 1))]
      const url = await randomPuppy(sub)
      if (!url) return message.edit('Unable to find images.')
      const attachment = new Discord.Attachment(url)
      message.edit(attachment).catch(msg.channel.send)
    }
    if (type === 'custom') {
      if (!msg.channel.nsfw) return msg.channel.send(lang._nsfw)
      if(/\s/gm.test(subreddit)) return msg.channel.send(lang.COMMAND_IMAGE_CANNOTSPACE)
      try { // eslint-disable-line
        return await sendImage([subreddit])
      } catch(e) {
        if (e.name === 'ParseError') return msg.channel.send(f(lang._error, 'Failed to parsing JSON. (Probably not found specified subreddit)'))
        throw e
      }
    } else if (type === 'anime') {
      return await sendImage([
        'Undertale',
        'Gunime',
        'anime',
        'animemes',
        'anikyar_ja',
        'PopTeamEpic',
        'GJbu',
        'touhou',
        'anime_irl',
        'animegifs',
        'AnimeFigures',
      ])
    } else {
      msg.channel.send(lang._invalid_args)
    }
  }
}
