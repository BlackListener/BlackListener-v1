const Discord = require('discord.js')
const randomPuppy = require('random-puppy')
const f = require('string-format')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        'anime',
        'nsfw|r18',
        'custom <subreddit>',
      ],
    }
    super('image', opts)
  }

  async run(msg, settings, lang) {
    const args = msg.content.replace(settings.prefix, '').split(' ')
    const sendImage = async list => {
      msg.channel.send(lang.searching)
      const sub = list[Math.round(Math.random() * (list.length - 1))]
      const url = await randomPuppy(sub)
      const attachment = new Discord.Attachment(url)
      msg.channel.send(attachment).catch(msg.channel.send)
    }
    if (args[1] === 'custom') {
      if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
      if(/\s/gm.test(args[2])) return msg.channel.send(lang.cannotspace)
      try {
        return await sendImage([args[2]])
      } catch(e) {
        if (e.name === 'ParseError') return msg.channel.send(f(lang.error, 'Failed to parsing JSON. (Probably not found specified subreddit)'))
        msg.channel.send(f(lang.error, e))
      }
    } else if (args[1] === 'anime') {
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
      msg.channel.send(lang.invalid_args)
    }
  }
}
