const f = require('string-format')
const Discord = require('discord.js')
const fetch = require('node-fetch')
const FormData = require('form-data')
const now = require('performance-now')
const s = require('../config.yml')

module.exports.args = ['[minecraft]', '[fortnite]']

module.exports.name = 'status'

module.exports.run = async function(msg, settings, lang) {
  const cmd = settings.prefix + 'status '
  const service = msg.content.slice(cmd.length)
  if (service === 'minecraft') {
    msg.channel.send(lang.status.checking)
    const status = ['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined']
    let i = 0
    const startTime = now()
    const data = await fetch('https://status.mojang.com/check').then(res => res.json())
    for (; i < data.length; i ++) {
      for (const key in data[i]){
        switch (data[i][key]){
          case 'green':
            status[i] = lang.status.ok
            break
          case 'red':
            status[i] = lang.status.down
            break
          case 'yellow':
            status[i] = lang.status.unstable
            break
          default:
            status[i] = lang.status.unknown
            break
        }
      }
    }
    const endTime = now()
    const time = endTime - startTime
    const embed = new Discord.RichEmbed()
      .setTitle(lang.status.title)
      .setURL('https://help.mojang.com')
      .setColor([0,255,0])
      .setFooter(f(lang.status.time, Math.floor(time)))
      .setTimestamp()
      .addField(lang.status.servers.minecraft, status[0])
      .addField(lang.status.servers.sessionminecraft, status[1])
      .addField(lang.status.servers.accountmojang, status[2])
      .addField(lang.status.servers.authservermojang, status[3])
      .addField(lang.status.servers.sessionservermojang, status[4])
      .addField(lang.status.servers.apimojang, status[5])
      .addField(lang.status.servers.texturesminecraft, status[6])
      .addField(lang.status.servers.mojang, status[7])
    return msg.channel.send(embed)
  } else if (service === 'fortnite') {
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
  } else {
    return msg.channel.send(lang.status.invalid)
  }
}
