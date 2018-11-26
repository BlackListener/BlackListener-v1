const env = require('dotenv-safe').config({allowEmptyValues: true}).parsed
const ytdl = require('ytdl-core')
const { Command, KlasaConsole } = require('klasa')
const logger = new KlasaConsole()
const isNumber = (n) => !isNaN(parseFloat(n)) && isFinite(n)
const f = require('string-format')
const YouTube = require('youtube-node')
const youtube = new YouTube()
const util = require('util')
const queue = {}
const playing = {}
const loop = {}
const play = (connection, url, msg) => {
  const stream = ytdl(url, { filter : 'audioonly' })
  loop[msg.guild.id] = {}
  playing[msg.guild.id] = url
  return connection.playStream(stream, { seek: 0, volume: 1 }) // oldvalue: 0.1
}

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'music',
      usage: '<join|play|stop|pause|unpause|volume|loop|queue|status> (URLorSearch:str)',
      aliases: [
        'play',
      ],
    })
  }

  run(msg, [type, ...params]) {
    if (!env.PATRON) return msg.channel.send(lang._not_patron)
    if (!msg.member.voiceChannel) return msg.channel.send(lang.COMMAND_MUSIC_NOT_JOINED_VC)
    loop[msg.guild.id] = {}
    return this[type](msg, params)
  }

  join(msg) {
    msg.member.voiceChannel.join().then(vc => msg.channel.send(f(lang.COMMAND_MUSIC_JOINED_VC, vc.channel.name))).catch(e => logger.error(e))
  }

  async play(msg, URL) {
    let keyword
    if (!URL || !URL.includes('youtube.com/watch?v=')) {
      if (!env.YOUTUBE_API_KEY) return msg.channel.send('Not specified API Key in config')
      youtube.setKey(env.YOUTUBE_API_KEY)
      const search = util.promisify(youtube.search)
      const { items } = await search(URL, 1).catch(e => logger.error(e))
      keyword = URL
      URL = 'https://youtube.com/watch?v=' + items[0].id.videoId // Oh no, this is (really) not a good!
    }
    msg.member.voiceChannel.join()
      .then(async connection => {
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
          if (loop[msg.guild.id].enabled) return msg.channel.send(lang.COMMAND_MUSIC_CANTADD_LOOP_ENABLED)
          if (!queue[msg.guild.id]) queue[msg.guild.id] = []
          queue[msg.guild.id].push(URL)
          msg.channel.send(f(lang.COMMAND_MUSIC_QUEUE_ADDED, URL))
          if (keyword) msg.channel.send('Search keyword: ' + keyword)
        } else {
          play(connection, URL, msg)
          msg.channel.send(f(lang.COMMAND_MUSIC_PLAYING, URL))
          if (keyword) msg.channel.send('Search keyword: ' + keyword)
        }
        if (msg.deletable) msg.delete()
        const endHandler = async () => {
          const q = queue[msg.guild.id]
          if (q && (q ? q.length : false) && !loop[msg.guild.id].enabled) { // if queue is *not* empty and not enabled loop
            play(connection, q[0], msg)
            msg.channel.send(f(lang.COMMAND_MUSIC_PLAYING_QUEUE, q[0]))
            queue[msg.guild.id] = queue[msg.guild.id].slice(1)
          } else { // if queue is empty or enabled looping
            if (!loop[msg.guild.id].enabled && !loop[msg.guild.id].every) { // loop is disabled
              msg.channel.send(lang.COMMAND_MUSIC_ENDED)
              if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher)
                msg.guild.voiceConnection.dispatcher.removeListener('end', endHandler)
            } else { // loop is enabled
              if (loop[msg.guild.id].every) {
                const seconds = parseInt(loop[msg.guild.id].every.replace(/\D{1,}/gm, '')) * 60
                setTimeout(() => {
                  play(connection, URL, msg)
                }, seconds * 1000)
              } else {
                play(connection, URL, msg)
              }
            }
          }
        }
        msg.guild.voiceConnection.dispatcher.on('end', endHandler)
      })
  }

  volume(msg, [volume]) {
    if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
      const before = msg.guild.voiceConnection.dispatcher.volume
      if (!isNumber(volume)) return msg.channel.send(lang._invalid_args)
      msg.guild.voiceConnection.dispatcher.setVolume(parseInt(volume) / 100)
      const emoji = before * 100 <= parseInt(volume) ? ':loud_sound:' : ':sound:'
      msg.channel.send(f(emoji + lang.COMMAND_MUSIC_CHANGED_VOLUME, before * 100, parseInt(volume))) // oldvalue: 100
    } else return msg.channel.send(lang.COMMAND_MUSIC_NOT_PLAYING)
  }

  skip(msg) {
    if (!loop[msg.guild.id].enabled && msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
      msg.guild.voiceConnection.dispatcher.end() // Just stop the music and send end event, and play queue.
    } else return msg.channel.send(lang.COMMAND_MUSIC_NOT_PLAYING + ' ...or enabled loop.')
  }

  stop(msg) {
    queue[msg.guild.id] = []
    if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
      msg.guild.voiceConnection.dispatcher.destroy() // destroy.
      if (msg.guild.me.voiceChannel && msg.guild.me.voiceChannel.connection) msg.guild.me.voiceChannel.connection.disconnect()
      msg.channel.send(':wave:')
    } else return msg.channel.send(lang.COMMAND_MUSIC_NOT_PLAYING)
  }

  loop(msg, [status, clear]) {
    Object.assign({[msg.guild.id]: []}, queue)
    //queue.push({[msg.guild.id]: []})
    if (status === 'disable') {
      loop[msg.guild.id].every = null
      loop[msg.guild.id].enabled = false
      msg.channel.send(lang.COMMAND_MUSIC_DISABLED_LOOPING)
    } else {
      if (status === 'every') {
        if (clear === 'clear') return loop[msg.guild.id].every = null
        if (!/\d{1,}m/gm.test(clear)) return msg.channel.send(lang._invalid_args)
        loop[msg.guild.id].enabled = true
        loop[msg.guild.id].every = clear
        msg.channel.send(f(lang.COMMAND_MUSIC_LOOP_EVERY, clear))
      } else {
        loop[msg.guild.id].enabled = loop[msg.guild.id].enabled ? false : true
        msg.channel.send(f(lang.COMMAND_MUSIC_ONE_MUSIC_LOOP, loop[msg.guild.id].enabled ? lang.COMMAND_MUSIC_ENABLED : lang.COMMAND_MUSIC_DISABLED))
      }
    }
  }

  pause(msg) {
    if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
      msg.guild.voiceConnection.dispatcher.pause()
      msg.channel.send(lang.COMMAND_MUSIC_PAUSED)
    } else msg.channel.send(lang.COMMAND_MUSIC_NOT_PLAYING)
  }

  unpause(msg) {
    if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed) {
      msg.guild.voiceConnection.dispatcher.resume()
      msg.channel.send(lang.COMMAND_MUSIC_UNPAUSED)
    } else msg.channel.send(lang.COMMAND_MUSIC_NOT_PLAYING)
  }

  queue(msg, [clear, reactivate]) {
    msg.channel.send(f(lang.COMMAND_MUSIC_QUEUE_COUNT, queue.length))
    if (clear === 'clear') {
      queue[msg.guild.id] = []
      return msg.channel.send(lang.COMMAND_MUSIC_CLEARED_QUEUE)
    } else if (reactivate === 'reactivate') {
      return msg.channel.send(f('You need to type this: ```\n{0}music stop\n{0}music play https://www.youtube.com/watch?v=jhFDyDgMVUI\n```', settings.prefix))
    }
    const queues = queue[msg.guild.id] ? queue[msg.guild.id].map((e, i) => `${i}: ${e}`) : []
    if (queues.length) msg.channel.send(queues.join('\n'))
  }

  status(msg) {
    if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.destroyed && playing[msg.guild.id]) msg.channel.send(f(lang.COMMAND_MUSIC_NOW_PLAYING, playing[msg.guild.id]))
    else msg.channel.send(lang.COMMAND_MUSIC_NOT_PLAYING)
  }
}
