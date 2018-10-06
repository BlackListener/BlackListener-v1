const fetch = require('node-fetch')
const isTravisBuild = process.argv.includes('--travis-build')
const s = isTravisBuild ? require(__dirname + '/../travis.yml') : require(__dirname + '/../secret.yml')
const { Command } = require('../core')
const logger = require('../logger').getLogger('commands:talkja', 'purple')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<話しかけたいこと(日本語のみ)>',
      ],
    }
    super('talkja', opts)
  }

  async run(msg, settings, lang) {
    if (s.talk_apikey == '' || s.talk_apikey == 'undefined') return msg.channel.send(lang.no_apikey)
    const voiceText = msg.content.replace(settings.prefix + ' talkja ', '')
    const id = await this.fetch('https://api.repl-ai.jp/v1/registration', { botId: 'sample' })
    if (!id) return msg.channel.send(lang.returned_invalid_response)
    const talkform = { botId: 'sample', ...id, initTalkingFlag: true, voiceText, initTopicId: 'docomoapi' }
    const data = await this.fetch('https://api.repl-ai.jp/v1/dialogue', talkform)
    if (!data) return msg.channel.send(lang.returned_invalid_response)
    await msg.channel.send(data.systemText.expression.replace('#', ''))
  }

  fetch(url, json) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(json),
      headers: {
        'x-api-key': s.talk_apikey,
        'Content-Type': 'application/json',
      },
    }).then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(json => json.errorMessage ? Promise.reject(json.errorMessage) : json)
      .catch(err => (logger.error('Repl-AI: ' + err), null))
  }
}
