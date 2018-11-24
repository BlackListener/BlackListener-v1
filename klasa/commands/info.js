const Discord = require('discord.js')
const os = require('os')
const isWindows = process.platform === 'win32'
const env = require('dotenv-safe').config({allowEmptyValues: true}).parsed
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'info',
    })
  }

  async run(msg) {
    const client = msg.client
    const loadavg = isWindows ? '利用不可' : Math.floor(os.loadavg()[0] * 100) / 100
    const invite = `https://discordapp.com/oauth2/authorize?scope=bot&client_id=${msg.client.user.id}&permissions=8`
    const owner = env.OWNERS.replace(/ /gm, '').split(',').map(aowner => {
      const user = client.users.get(aowner)
      return `${user.tag} (${user.id})\n`
    })
    msg.channel.send(new Discord.MessageEmbed()
      .setTitle('Bot info')
      .setTimestamp()
      .setColor([0,255,0])
      .addField(lang.COMMAND_INFO_MEMORY, `${lang.COMMAND_INFO_MEMORY_MAX}: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB\n${lang.COMMAND_INFO_MEMORY_USAGE}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB\n${lang.COMMAND_INFO_MEMORY_FREE}: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`)
      .addField(lang.COMMAND_INFO_CPU, `${lang.COMMAND_INFO_THREADS}: ${os.cpus().length}\n${lang.COMMAND_INFO_CPU_MODEL}: ${os.cpus()[0].model}\n${lang.COMMAND_INFO_CPU_SPEED}: ${os.cpus()[0].speed}`)
      .addField(lang.COMMAND_INFO_PLATFORM, os.platform)
      .addField(lang.COMMAND_INFO_LOADAVG, loadavg)
      .addField(lang.COMMAND_INFO_SERVERS, client.guilds.size, true)
      .addField(lang.COMMAND_INFO_USERS, client.users.size, true)
      .addField(lang.COMMAND_INFO_CREATEDBY, owner)
      .setDescription(`[${lang.COMMAND_INFO_INVITE}](${invite})\n[${lang.COMMAND_INFO_SOURCE}](https://github.com/BlackListener/BlackListener)\n[Discord Bots](https://discordbots.org/bot/456966161079205899)`)
      .setFooter(`Sent by ${msg.author.tag}`))
  }
}
