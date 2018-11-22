const f = require('string-format')
const Discord = require('discord.js')
const fetch = require('node-fetch')
const FormData = require('form-data')
const now = require('performance-now')
const s = require(__dirname + '/../config.yml')
const { Command } = require('../core')

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
        green: lang.COMMAND_STATUS_OK,
        red: lang.COMMAND_STATUS_DOWN,
        yellow: lang.COMMAND_STATUS_UNSTABLE,
      },
      fortnite: {
        UP: lang.COMMAND_STATUS_OK,
        DOWN: lang.COMMAND_STATUS_DOWN,
      },
    }
    const cmd = settings.prefix + 'status '
    const service = msg.content.slice(cmd.length)
    if (service === 'minecraft') {
      msg.channel.send(lang.COMMAND_STATUS_CHECKING)
      const startTime = now()
      const data = await fetch('https://status.mojang.com/check').then(res => res.json())
      const flat = data.reduce((p, c) => Object.assign(p, c), {})
      const status = Object.keys(flat).map(key => STATUS.minecraft[flat[key]] || lang.COMMAND_STATUS_UNKNOWN)
      const endTime = now()
      const time = endTime - startTime
      const embed = new Discord.RichEmbed()
        .setTitle(lang.COMMAND_STATUS_TITLE)
        .setURL('https://help.mojang.com')
        .setColor([0,255,0])
        .setFooter(f(lang.COMMAND_STATUS_TIME, Math.floor(time)))
        .setTimestamp()
        .addField(lang.COMMAND_STATUS_SERVERS_MINECRAFT, status[0])
        .addField(lang.COMMAND_STATUS_SERVERS_SESSIONMINECRAFT, status[1])
        .addField(lang.COMMAND_STATUS_SERVERS_ACCOUNTMOJANG, status[2])
        .addField(lang.COMMAND_STATUS_SERVERS_AUTHSERVERMOJANG, status[3])
        .addField(lang.COMMAND_STATUS_SERVERS_SESSIONSERVERMOJANG, status[4])
        .addField(lang.COMMAND_STATUS_SERVERS_APIMOJANG, status[5])
        .addField(lang.COMMAND_STATUS_SERVERS_TEXTURESMINECRAFT, status[6])
        .addField(lang.COMMAND_STATUS_SERVERS_MOJANG, status[7])
      return msg.channel.send(embed)
    } else if (service === 'fortnite') {
      if (s.fortnite_api_key === '') return msg.channel.send(lang.COMMAND_STATUS_NO_APIKEY)
      msg.channel.send(lang.COMMAND_STATUS_CHECKING)
      const startTime = now()
      const data = await fetch('https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status', {
        method: 'POST',
        headers: {
          'Authorization': s.fortnite_api_key,
          'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        },
        body: new FormData().append('username', 'username'),
      }).then(res => res.json())
      const status = STATUS.fortnite[data.status] || lang.COMMAND_STATUS_UNKNOWN
      const endTime = now()
      const time = endTime - startTime
      const embed = new Discord.RichEmbed()
        .setTitle(lang.COMMAND_STATUS_TITLE)
        .setURL('https://status.epicgames.com')
        .setColor([0,255,0])
        .setFooter(f(lang.COMMAND_STATUS_TIME, Math.floor(time)))
        .setTimestamp()
        .addField(lang.COMMAND_STATUS_SERVERS_FORTNITE, status)
      return msg.channel.send(embed)
    } else {
      return msg.channel.send(lang.COMMAND_STATUS_INVALID)
    }
  }
}
