const fetch = require('node-fetch')
const isTravisBuild = process.argv[2] === '--travis-build'
const s = isTravisBuild ? require('../travis.yml') : require('../secret.yml')

module.exports.args = ['<<話しかけたいこと(日本語のみ)>>']

module.exports.name = 'talkja'

module.exports.run = async function(msg, settings, lang) {
  const args = msg.content.replace(settings.prefix, '').split(' ')
  if (s.talk_apikey == '' || s.talk_apikey == 'undefined' || !s.talk_apikey) return msg.channel.send(lang.no_apikey)
  let status = '？？？'
  const header = {
    'x-api-key': s.talk_apikey,
    'Content-Type': 'application/json',
  }
  const resreg = await fetch('https://api.repl-ai.jp/v1/registration', { method: 'POST', body: '{botId: sample}', headers: header })
  if (resreg.status !== 200) return msg.channel.send(lang.returned_invalid_response)
  const resjson = await resreg.json()
  const userId = resjson.appUserId
  const talkform = `{ "botId": "sample", "appUserId": ${userId}, "initTalkingFlag": true, "voiceText": ${args[1]}, "initTopicId": "docomoapi" }`
  const talkheader = {
    'x-api-key': s.talk_apikey,
    'Content-Type': 'application/json',
  }
  return (async function () {
    const res = await fetch('https://api.repl-ai.jp/v1/dialogue', { method: 'POST', body: talkform, headers: talkheader })
    if (res.status !== 200) return msg.channel.send(lang.returned_invalid_response)
    const data = await res.json()
    status = data.systemText.expression
    await msg.channel.send(status.replace('#', ''))
  }) ()
}
