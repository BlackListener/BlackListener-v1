const Discord = require('discord.js')
const util = require('../util')
const {promisify} = require('util')
const exec = promisify(require('child_process').exec)
const os = require('os')
const c = require('../config.yml')
const isWindows = process.platform === 'win32'

module.exports.name = 'info'

module.exports.run = async function(msg, settings, lang) {
  const s = await util.exists('./secret.json5') ? require('../secret.json5') : require('../travis.json5')
  const client = msg.client
  const graph = 'Device    Total  Used Avail Use% Mounted on\n'
  let o1 = '利用不可'
  let loadavg = '利用不可'
  const invite = s.inviteme
  if (!isWindows) {
    const { stdout } = await exec('df -h | grep /dev/sda')
    o1 = stdout
    loadavg = Math.floor(os.loadavg()[0] * 100) / 100
  }
  const embed = new Discord.RichEmbed()
    .setTitle('Bot info')
    .setTimestamp()
    .setColor([0,255,0])
    .addField(lang.info.memory, `${lang.info.memory_max}: ${Math.round(os.totalmem() / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_usage}: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB\n${lang.info.memory_free}: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100}MB`)
    .addField(lang.info.cpu, `${lang.info.threads}: ${os.cpus().length}\n${lang.info.cpu_model}: ${os.cpus()[0].model}\n${lang.info.cpu_speed}: ${os.cpus()[0].speed}`)
    .addField(lang.info.disk, `${graph}${o1}`)
    .addField(lang.info.platform, `${os.platform}`)
    .addField(lang.info.loadavg, `${loadavg}`)
    .addField(lang.info.servers, `${client.guilds.size}`)
    .addField(lang.info.users, `${client.users.size}`)
    .addField(lang.info.createdBy, `${client.users.get('254794124744458241').tag} (${client.users.get('254794124744458241').id})`)
    .setDescription(`[${lang.info.invite}](${invite})\n[${lang.info.source}](${c.github})\n[![Discord Bots](https://discordbots.org/api/widget/456966161079205899.svg)](https://discordbots.org/bot/456966161079205899)`)
    .setFooter(`Sent by ${msg.author.tag}`)
  return msg.channel.send(embed)
}
