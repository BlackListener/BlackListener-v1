const f = require('string-format')
const Discord = require('discord.js')
const fetch = require('node-fetch')
const FormData = require('form-data')
const now = require('performance-now')
const env = require('dotenv-safe').config({allowEmptyValues: true}).parsed
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'status',
      subcommands: true,
      usage: '<minecraft|fortnite>',
    })
  }

  async minecraft(msg) {
    msg.channel.send(lang.COMMAND_STATUS_CHECKING)
    const startTime = now()
    const data = await fetch('https://status.mojang.com/check').then(res => res.json())
    const flat = data.reduce((p, c) => Object.assign(p, c), {})
    const status = Object.keys(flat).map(key => this.STATUS.minecraft[flat[key]] || lang.COMMAND_STATUS_UNKNOWN)
    const endTime = now()
    const time = endTime - startTime
    const embed = new Discord.MessageEmbed()
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
  }

  async fortnite(msg) {
    if (env.FORTNITE_API_KEY === '') return msg.channel.send(lang.COMMAND_STATUS_NO_APIKEY)
    msg.channel.send(lang.COMMAND_STATUS_CHECKING)
    const startTime = now()
    const data = await fetch('https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status', {
      method: 'POST',
      headers: {
        'Authorization': env.FORTNITE_API_KEY,
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
      },
      body: new FormData().append('username', 'username'),
    }).then(res => res.json())
    const status = this.STATUS.fortnite[data.status] || lang.COMMAND_STATUS_UNKNOWN
    const endTime = now()
    const time = endTime - startTime
    const embed = new Discord.MessageEmbed()
      .setTitle(lang.COMMAND_STATUS_TITLE)
      .setURL('https://status.epicgames.com')
      .setColor([0,255,0])
      .setFooter(f(lang.COMMAND_STATUS_TIME, Math.floor(time)))
      .setTimestamp()
      .addField(lang.COMMAND_STATUS_SERVERS_FORTNITE, status)
    return msg.channel.send(embed)
  }

  init() {
    this.STATUS = {
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
  }
}
