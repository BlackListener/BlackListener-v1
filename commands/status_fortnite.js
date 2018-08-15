const f = require('string-format')
const Discord = require('discord.js')
const fetch = require('node-fetch')
const FormData = require('form-data')
const now = require('performance-now')

module.exports = async function(s, msg, lang) {
  if (s.fortnite_api_key === '') return msg.channel.send(lang.no_apikey)
  msg.channel.send(lang.status.checking)
  let status = 'Unknown'
  const startTime = now()
  const data = await fetch('https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status', {
    method: 'POST',
    headers: {
      'Authorization': s.fortnite_api_key,
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    },
    body: new FormData().append('username', 'username'),
  }).then(res => res.json())
  if (data.status === 'UP') {
    status = lang.status.ok
  } else if (data.status === 'DOWN') {
    status = lang.status.down
  } else {
    status = lang.status.unknown
  }
  const endTime = now()
  const time = endTime - startTime
  const embed = new Discord.RichEmbed()
    .setTitle(lang.status.title)
    .setURL('https://status.epicgames.com')
    .setColor([0,255,0])
    .setFooter(f(lang.status.time, Math.floor(time)))
    .setTimestamp()
    .addField(lang.status.servers.fortnite, status)
  return msg.channel.send(embed)
}
