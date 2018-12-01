const { MessageAttachment } = require('discord.js')
const randomPuppy = require('random-puppy')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'image',
      description: language => language.get('COMMAND_IMAGE_DESCRIPTION'),
      usage: '<anime|custom> [subreddit:str]',
      usageDelim: ' ',
    })
  }

  async run(msg, [type, subreddit]) {
    const sendImage = async list => {
      const target = await msg.sendLocale('COMMAND_IMAGE_SEARCHING')
      const sub = list[Math.round(Math.random() * (list.length - 1))]
      const url = await randomPuppy(sub)
      if (!url) return msg.send('Unable to find images.').then(() => target.delete(0))
      const attachment = new MessageAttachment(url)
      msg.send(attachment).catch(msg.channel.send).then(() => target.delete(0))
    }
    if (type === 'custom') {
      if (!msg.channel.nsfw) return msg.sendLocale('_nsfw')
      if(/\s/gm.test(subreddit)) return msg.sendLocale('COMMAND_IMAGE_CANNOTSPACE')
      return await sendImage([subreddit]).catch(e => {
        if (e.name === 'ParseError') return msg.sendLocale('_error', ['Failed to parsing JSON. (Probably not found specified subreddit)'])
        throw e
      })
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
      msg.sendLocale('_invalid_args')
    }
  }
}
