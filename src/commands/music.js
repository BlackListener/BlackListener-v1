const config = require(__dirname + '/../config.yml')
const ytdl = require('ytdl-core')
const logger = require(__dirname + '/../logger').getLogger('commands:music')
const isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n) }
const f = require('string-format')
const { Command } = require('../core')
const YouTube = require('youtube-node')
const youtube = new YouTube()
const util = require('util')
let queue = []
let playing
let loop
const play = (connection, url, msg, lang) => {
  try {
    const stream = ytdl(url, { filter : 'audioonly' })
    playing = url
    return connection.playStream(stream, { seek: 0, volume: 1 }) // 0.1
  } catch (e) {
    if (e.name === 'TypeError') msg.channel.send(f(lang.error, e))
    logger.error(e)
  }
}

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        'play|start <URL or Search>',
        'stop',
        'pause',
        'unpause|resume',
        'volume',
        'loop',
        'queue',
        'status',
      ],
      alias: [
        'play',
      ],
    }
    super('music', opts)
  }

  async run(msg, settings, lang) {
    if (!config.patron) { return msg.channel.send(lang.not_patron) }
    if (!msg.member.voiceChannel) return msg.channel.send(lang.music.not_joined_vc)
    const args = msg.content.replace(settings.prefix, '').split(' ')
    if (args[1] === 'join') {
      msg.member.voiceChannel.join().then(vc => msg.channel.send(f(lang.music.joined_vc, vc.channel.name))).catch(e => logger.error(e))
    } else if (args[1] === 'play' || args[1] === 'start') {
      if (!args[2] || !args[2].includes('youtube.com/watch?v=')) {
        youtube.setKey(config.youtube_apikey)
        const search = util.promisify(youtube.search)
        const { items } = await search(args.slice(2).join(' '), 10).catch(e => logger.error(e))
        let message = ''
        items.forEach(item => {
          message += `${item.snippet.title} (https://youtube.com/watch?v=${item.id.videoId})\n`
        })
        message += lang.youtube_search
        msg.channel.send(message)
        return
      }
      msg.member.voiceChannel.join()
        .then(async connection => {
          if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
            if (loop) return msg.channel.send(lang.music.cantadd_loop_enabled)
            queue.push(args[2])
            msg.channel.send(f(lang.music.queue_added, args[2]))
          } else {
            play(connection, args[2], msg, lang)
            msg.channel.send(f(lang.music.playing, args[2]))
          }
          if (msg.deletable) msg.delete()
          /*async () => {
            if (queue.length && !loop) {
              dispatcher = play(connection, queue[0], msg, lang)
              msg.channel.send(f(lang.music.playing_queue, queue[0]))
            } else {
              if (!loop) {
                dispatcher = null
                msg.channel.send('すべての曲の再生が終了しました。')
              } else {
                dispatcher = play(connection, args[2], msg, lang)
              }
            }
          }*/
          const endHandler = async q => {
            logger.info('ended')
            if (q.length && !loop) {
              logger.info('and playing queue')
              play(connection, q[0], msg, lang)
              msg.channel.send(f(lang.music.playing_queue, q[0]))
              q = q.slice(1)
              register(q) //eslint-disable-line
            } else {
              if (!loop) {
                msg.channel.send('すべての曲の再生が終了しました。')
              } else {
                play(connection, args[2], msg, lang)
                register(q) //eslint-disable-line
              }
            }
          }
          const register = q => {
            queue = q
            msg.guild.voiceConnection.dispatcher.once('end', () => endHandler(q))
            msg.guild.voiceConnection.dispatcher.once('close', () => endHandler(q))
          }
          register(queue)
        })
    } else if (args[1] === 'volume') {
      if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
        const before = msg.guild.voiceConnection.dispatcher.volume
        if (!isNumber(args[2])) return msg.channel.send(lang.invalid_args)
        msg.guild.voiceConnection.dispatcher.setVolume(parseInt(args[2]) / 1000)
        const emoji = before * 1000 <= parseInt(args[2]) ? ':loud_sound:' : ':sound:'
        msg.channel.send(f(emoji + lang.music.changed_volume, before * 100, parseInt(args[2]))) // 100
      } else msg.channel.send(lang.music.not_playing)
    } else if (args[1] === 'stop') {
      if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
        msg.guild.voiceConnection.dispatcher.destroy()
        if (msg.guild.me.voiceChannel && msg.guild.me.voiceChannel.connection) msg.guild.me.voiceChannel.connection.disconnect()
        msg.channel.send(':wave:')
      } else msg.channel.send(lang.music.not_playing)
    } else if (args[1] === 'loop') {
      queue = []
      loop = loop ? false : true
      msg.channel.send(f(lang.music.one_music_loop, loop ? lang.music.enabled : lang.music.disabled))
    } else if (args[1] === 'pause') {
      if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
        msg.guild.voiceConnection.dispatcher.pause()
        msg.channel.send(lang.music.paused)
      } else msg.channel.send(lang.music.not_playing)
    } else if (args[1] === 'unpause' || args[1] === 'resume') {
      if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
        msg.guild.voiceConnection.dispatcher.resume()
        msg.channel.send(lang.music.unpaused)
      } else msg.channel.send(lang.music.not_playing)
    } else if (args[1] === 'queue') {
      msg.channel.send(f(lang.music.queue_count, queue.length))
      if (args[2] === 'clear') {
        queue = []
        return msg.channel.send(lang.music.cleared_queue)
      } else if (args[2] === 'reactivate') {
        return msg.channel.send('You need to type this: ```\n<prefix>music stop\n<prefix>music play https://www.youtube.com/watch?v=jhFDyDgMVUI\n```')
      }
      const queues = queue.map((e, i) => `${i}: ${e}`)
      if (queues.length) msg.channel.send(queues.join('\n'))
    } else if (args[1] === 'status') {
      if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed && playing) msg.channel.send(f(lang.music.now_playing, playing))
      else msg.channel.send(lang.music.not_playing)
    } else msg.channel.send(lang.invalid_args)
  }
}
