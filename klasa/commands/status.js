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
    const STATUS = {
      green: msg.language.get('COMMAND_STATUS_OK'),
      red: msg.language.get('COMMAND_STATUS_DOWN'),
      yellow: msg.language.get('COMMAND_STATUS_UNSTABLE'),
    }
    msg.sendLocale('COMMAND_STATUS_CHECKING')
    const startTime = now()
    const data = await fetch('https://status.mojang.com/check').then(res => res.json())
    const flat = data.reduce((p, c) => Object.assign(p, c), {})
    const status = Object.keys(flat).map(key => STATUS[flat[key]] || msg.language.get('COMMAND_STATUS_UNKNOWN'))
    const endTime = now()
    const time = endTime - startTime
    const embed = new Discord.MessageEmbed()
      .setTitle(msg.language.get('COMMAND_STATUS_TITLE'))
      .setURL('https://help.mojang.com')
      .setColor([0,255,0])
      .setFooter(msg.language.get('COMMAND_STATUS_TIME', Math.floor(time)))
      .setTimestamp()
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_MINECRAFT'), status[0])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_SESSIONMINECRAFT'), status[1])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_ACCOUNTMOJANG'), status[2])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_AUTHSERVERMOJANG'), status[3])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_SESSIONSERVERMOJANG'), status[4])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_APIMOJANG'), status[5])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_TEXTURESMINECRAFT'), status[6])
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_MOJANG'), status[7])
    return msg.channel.send(embed)
  }

  async fortnite(msg) {
    if (env.FORTNITE_API_KEY === '') return msg.sendLocale('COMMAND_STATUS_NO_APIKEY')
    const STATUS = {
      UP: msg.language.get('COMMAND_STATUS_OK'),
      DOWN: msg.language.get('COMMAND_STATUS_DOWN'),
    }
    msg.sendLocale('COMMAND_STATUS_CHECKING')
    const startTime = now()
    const data = await fetch('https://fortnite-public-api.theapinetwork.com/prod09/status/fortnite_server_status', {
      method: 'POST',
      headers: {
        'Authorization': env.FORTNITE_API_KEY,
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
      },
      body: new FormData().append('username', 'username'),
    }).then(res => res.json())
    const status = STATUS[data.status] || msg.language.get('COMMAND_STATUS_UNKNOWN')
    const endTime = now()
    const time = endTime - startTime
    const embed = new Discord.MessageEmbed()
      .setTitle(msg.language.get('COMMAND_STATUS_TITLE'))
      .setURL('https://status.epicgames.com')
      .setColor([0,255,0])
      .setFooter(msg.language.get('COMMAND_STATUS_TIME', Math.floor(time)))
      .setTimestamp()
      .addField(msg.language.get('COMMAND_STATUS_SERVERS_FORTNITE'), status)
    return msg.channel.send(embed)
  }
}
