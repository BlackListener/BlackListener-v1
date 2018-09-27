const config = require(__dirname + '/../config.yml')
const ytdl = require('ytdl-core')
const Discord = require('discord.js') // eslint-disable-line
const logger = require('../logger').getLogger('commands:music')
const isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n) }
const f = require('string-format')
let queue = []
let playing
let loop
const play = (connection, url) => {
  const stream = ytdl(url, { filter : 'audioonly' })
  playing = url
  return connection.play(stream, { seek: 0, volume: 0.1 })
}

/**
 * @type {Discord.StreamDispatcher}
 */
let dispatcher

module.exports.name = 'music'

module.exports.alias = ['play']

module.exports.args = ['play|start <URL>', 'stop', 'pause', 'unpause|resume', 'volume', 'loop', 'queue', 'status']

/**
 * @param {Discord.Message} msg 
 */
module.exports.run = async (msg, settings, lang) => {
  if (!config.patron) { return msg.channel.send(lang.not_patron) }
  if (!msg.member.voice.channel) return msg.channel.send(lang.music.not_joined_vc)
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (args[1] === 'play' || args[1] === 'start') {
    if (!args[2] || !args[2].includes('youtube.com/watch?v=')) return msg.channel.send(lang.invalid_args)
    msg.member.voice.channel.join()
      .then(async connection => {
        if (dispatcher) {
          if (loop) return msg.channel.send(lang.music.cantadd_loop_enabled)
          queue.push(args[2])
          msg.channel.send(f(lang.music.queue_added, args[2]))
        } else {
          dispatcher = play(connection, args[2])
          msg.channel.send(f(lang.music.playing, args[2]))
        }
        dispatcher.on('end' || 'close', async () => {
          if (queue !== [] && !loop) {
            let i
            for (i=0;i<=queue.length;i++) {
              if (queue[i]) {
                dispatcher = play(connection, queue[i])
                break
              }
            }
            msg.channel.send(f(lang.music.playing_queue, queue[i]))
          } else {
            if (!loop) {
              dispatcher = null
              msg.channel.send('すべての曲の再生が終了しました。')
            } else {
              dispatcher = play(connection, args[2])
            }
          }
        })
      }).catch(e => {
        if (e.name === 'TypeError') msg.channel.send(f(lang.error, e))
        logger.error(e)
      })
  } else if (args[1] === 'volume') {
    if (dispatcher) {
      const before = dispatcher.volume
      if (!isNumber(args[2])) return msg.channel.send(lang.invalid_args)
      dispatcher.setVolume(parseInt(args[2]) / 100)
      const emoji = before * 100 <= parseInt(args[2]) ? ':loud_sound:' : ':sound:'
      msg.channel.send(f(emoji + lang.music.changed_volume, before * 100, parseInt(args[2])))
    } else msg.channel.send(lang.music.not_playing)
  } else if (args[1] === 'stop') {
    if (dispatcher) {
      dispatcher.destroy()
      if (msg.guild.me.voice.channel) msg.guild.me.voice.channel.disconnect()
      msg.channel.send(':wave:')
    } else msg.channel.send(lang.music.not_playing)
  } else if (args[1] === 'loop') {
    queue = []
    loop = loop ? false : true
    msg.channel.send(f(lang.music.one_music_loop, loop ? lang.music.enabled : lang.music.disabled))
  } else if (args[1] === 'pause') {
    if (dispatcher) {
      dispatcher.pause()
      msg.channel.send(lang.music.paused)
    } else msg.channel.send(lang.music.not_playing)
  } else if (args[1] === 'unpause' || args[1] === 'resume') {
    if (dispatcher) {
      dispatcher.resume()
      msg.channel.send(lang.music.unpaused)
    } else msg.channel.send(lang.music.not_playing)
  } else if (args[1] === 'queue') {
    msg.channel.send(f(lang.music.queue_count, queue.length))
    if (args[2] === 'clear') {
      queue = []
      return msg.channel.send(lang.music.cleared_queue)
    }
    const queues = []
    let actual = 0
    for (let i=0;i<=queue.length;i++) {
      if (queue[i]) {
        actual++
        queues.push(`${actual}: ${queue[i]}`)
      }
    }
    if (queues !== []) msg.channel.send(queues.join('\n'))
  } else if (args[1] === 'status') {
    if (dispatcher && playing) msg.channel.send(f(lang.music.now_playing, playing))
    else msg.channel.send(lang.music.not_playing)
  } else msg.channel.send(lang.invalid_args)
}
