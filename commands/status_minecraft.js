const f = require('string-format')
const now = require('performance-now')
const Discord = require('discord.js')
const fetch = require('node-fetch')

module.exports = async function(msg, lang) {
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
}
