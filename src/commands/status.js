const fetch = require('node-fetch')
const FormData = require('form-data')
const now = require('performance-now')
const { commons: { f }, Command, Discord, config: s } = require('../core')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '[minecraft]',
        '[fortnite]',
      ],
    }
    super('status', opts)
  }

  async run(msg, settings, lang) {
    const STATUS = {
      minecraft: {
        green: lang.status.ok,
        red: lang.status.down,
        yellow: lang.status.unstable,
      },
      fortnite: {
        UP: lang.status.ok,
        DOWN: lang.status.down,
      },
    }
    const cmd = settings.prefix + 'status '
    const service = msg.content.slice(cmd.length)
    if (service === 'minecraft') {
      const message = await msg.channel.send(lang.status.checking)
      const startTime = now()
      const data = await fetch('https://status.mojang.com/check').then(res => res.json())
      const flat = data.reduce((p, c) => Object.assign(p, c), {})
      const status = Object.keys(flat).map(key => STATUS.minecraft[flat[key]] || lang.status.unknown)
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
      return message.edit(embed)
    } else if (service === 'fortnite') {
      if (s.fortnite_api_key === '') return msg.channel.send(lang.no_apikey)
      const message = await msg.channel.send(lang.status.checking)
      const startTime = now()
      const data = await fetch('https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status', {
        method: 'POST',
        headers: {
          'Authorization': s.fortnite_api_key,
          'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        },
        body: new FormData().append('username', 'username'),
      }).then(res => res.json())
      const status = STATUS.fortnite[data.status] || lang.status.unknown
      const endTime = now()
      const time = endTime - startTime
      const embed = new Discord.RichEmbed()
        .setTitle(lang.status.title)
        .setURL('https://status.epicgames.com')
        .setColor([0,255,0])
        .setFooter(f(lang.status.time, Math.floor(time)))
        .setTimestamp()
        .addField(lang.status.servers.fortnite, status)
      return message.edit(embed)
    } else {
      return msg.channel.send(lang.status.invalid)
    }
  }
}
