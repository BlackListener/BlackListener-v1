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
    const loadavg = isWindows ? '利用不可' : Math.floor(os.loadavg()[0] * 100) / 100
    const invite = `https://discordapp.com/oauth2/authorize?scope=bot&client_id=${msg.client.user.id}&permissions=8`
    const owner = async () => await Promise.all(env.OWNERS.replace(/ /gm, '').split(',').map(async aowner => {
      const user = await msg.client.users.fetch(aowner, false).catch(() => {
        throw new Error(`Invalid User: ${aowner}`)
      })
      return `\`${user.tag}\` (${user.id})`
    }))
    msg.channel.send(new Discord.MessageEmbed()
      .setTitle('Bot info')
      .setTimestamp()
      .setColor([0,255,0])
      .addField(msg.language.get('COMMAND_INFO_MEMORY'), `${msg.language.get('COMMAND_INFO_MEMORY_MAX')}: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB\n${msg.language.get('COMMAND_INFO_MEMORY_USAGE')}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB\n${msg.language.get('COMMAND_INFO_MEMORY_FREE')}: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`)
      .addField(msg.language.get('COMMAND_INFO_CPU'), `${msg.language.get('COMMAND_INFO_THREADS')}: ${os.cpus().length}\n${msg.language.get('COMMAND_INFO_CPU_MODEL')}: ${os.cpus()[0].model}\n${msg.language.get('COMMAND_INFO_CPU_SPEED')}: ${os.cpus()[0].speed}`)
      .addField(msg.language.get('COMMAND_INFO_PLATFORM'), os.platform)
      .addField(msg.language.get('COMMAND_INFO_LOADAVG'), loadavg)
      .addField(msg.language.get('COMMAND_INFO_SERVERS'), msg.client.guilds.size, true)
      .addField(msg.language.get('COMMAND_INFO_USERS'), msg.client.users.size, true)
      .addField(msg.language.get('COMMAND_INFO_CREATEDBY'), await owner())
      .setDescription(`[${msg.language.get('COMMAND_INFO_INVITE')}](${invite})\n[${msg.language.get('COMMAND_INFO_SOURCE')}](https://github.com/BlackListener/BlackListener)\n[Discord Bots](https://discordbots.org/bot/456966161079205899)`)
      .setFooter(`Sent by ${msg.author.tag}`))
  }
}
