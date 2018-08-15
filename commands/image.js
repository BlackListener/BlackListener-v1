const Discord = require('discord.js')
const randomPuppy = require('random-puppy')
const logger = require('../logger').getLogger('commands:image', 'blue')

module.exports = async function(settings, msg, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const sendImage = async list => {
    msg.channel.send(lang.searching)
    if (!msg.channel.nsfw) return msg.channel.send(lang.nsfw)
    const sub = list[Math.round(Math.random() * (list.length - 1))]
    const url = await randomPuppy(sub)
    const attachment = new Discord.Attachment(url)
    msg.channel.send(attachment).catch(msg.channel.send)
  }
  if (args[1] === 'custom') {
    if(/\s/gm.test(args[2])) return msg.channel.send(lang.cannotspace)
    return await sendImage([args[2]])
  } else if (args[1] === 'anime') {
    return await sendImage([
      'Undertale',
      'awwnime',
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
  } else if (['nsfw', 'r18'].includes(args[1])) {
    await sendImage([
      'HENTAI_GIF',
      'hentai_irl',
      'NSFW_Wallpapers',
      'SexyWallpapers',
      'HighResNSFW',
      'nsfw_hd',
      'UHDnsfw',
    ])
  } else {
    const embed = new Discord.RichEmbed().setImage('https://i.imgur.com/rc8mMFi.png').setTitle('引数が').setColor([0,255,0])
      .setDescription(':thumbsdown: 足りないのでコマンド実行できなかったよ :frowning:\n:thumbsdown: もしくは引数が間違ってるよ :frowning:')
    return msg.channel.send(embed).catch(logger.error)
  }
}
