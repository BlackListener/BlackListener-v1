const Discord = require('discord.js')
const os = require('os')
const c = require(__dirname + '/../config.yml')
const isWindows = process.platform === 'win32'
const isTravisBuild = process.argv.includes('--travis-build')
const s = isTravisBuild ? require(__dirname + '/../travis.yml') : require(__dirname + '/../config.yml')
const { Command } = require('../core')

module.exports = class extends Command {
  constructor() {
    super('info')
  }

  async run(msg, settings, lang) {
    const loadavg = isWindows ? '利用不可' : Math.floor(os.loadavg()[0] * 100) / 100
    const invite = s.inviteme
    //const owner = await Promise.all(s.owners.map(async id => await msg.client.fetchUser(id).then(user => `${user.tag} (${user.id})`)))
    const owner = await Promise.all(s.owners.map(id => msg.client.fetchUser(id).then(user => `${user.tag} (${user.id})`)))
    msg.channel.send(new Discord.RichEmbed()
      .setTitle('Bot info')
      .setTimestamp()
      .setColor([0,255,0])
      .addField(lang.info.memory, `${lang.info.memory_max}: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_usage}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_free}: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`)
      .addField(lang.info.cpu, `${lang.info.threads}: ${os.cpus().length}\n${lang.info.cpu_model}: ${os.cpus()[0].model}\n${lang.info.cpu_speed}: ${os.cpus()[0].speed}`)
      .addField(lang.info.platform, os.platform)
      .addField(lang.info.loadavg, loadavg)
      .addField(lang.info.servers, msg.client.guilds.size, true)
      .addField(lang.info.users, msg.client.users.size, true)
      .addField(lang.info.createdBy, owner)
      .setDescription(`[${lang.info.invite}](${invite})\n[${lang.info.source}](${c.github})\n[Discord Bots](https://discordbots.org/bot/456966161079205899)`)
      .setFooter(`Sent by ${msg.author.tag}`))
  }
}
