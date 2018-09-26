const ytdl = require('ytdl-core')
const Discord = require('discord.js')
const logger = require('../logger').getLogger('commands:music')
const isNumber = (n) => { return !isNaN(parseFloat(n)) && isFinite(n) }

module.exports.name = 'music'

module.exports.alias = ['play']

module.exports.args = ['play|start <URL>', 'stop', 'pause', 'unpause|resume', 'volume']

/**
 * @param {Discord.Message} msg 
 */
module.exports.run = async (msg, settings, lang) => {
  if (!msg.member.voice.channel) return msg.channel.send(':warning: このコマンドを実行する前に、ボイスチャンネルに参加する必要があります。')
  msg.channel.send(':construction: 開発中機能のため、日本語専用です。 - Due to developing, __Japanese__ only. (But will available when stable) :warning:')
  const args = msg.content.replace(settings.prefix, '').split(' ')
  const streamOptions = { seek: 0, volume: 100 }
  /**
   * @type {Discord.StreamDispatcher}
   */
  let dispatcher
  /**
   * @type {Discord.VoiceConnection}
   */
  let con
  if (args[1] === 'play' || args[1] === 'start') {
    if (!args[2].includes('https://www.youtube.com/watch?v=')) return msg.channel.send(lang.invalid_args)
    msg.member.voice.channel.join()
      .then(connection => {
        con = connection
        const stream = ytdl(args[2], { filter : 'audioonly' })
        dispatcher = connection.play(stream, streamOptions)
        const handler = () => {
          msg.channel.send('再生を開始しました。')
        }
        dispatcher.once('start', handler)
        msg.channel.send(`<:yes:494322173423517707> ${args[2]} を再生中`)
      }).catch(e => logger.error(e))
  } else if (args[1] === 'volume') {
    if (!isNumber(args[2])) return msg.channel.send(lang.invalid_args)
    dispatcher.setVolume(args[2])
  } else if (args[1] === 'stop') {
    dispatcher.destroy()
    con.disconnect()
    msg.channel.send('じゃあの')
  } else if (args[1] === 'pause') {
    dispatcher.pause()
  } else if (args[1] === 'unpause' || args[1] === 'resume') {
    dispatcher.resume()
  } else msg.channel.send(lang.invalid_args)
}
