const Discord = require('discord.js')
const fs = require('fs').promises
const f = require('string-format')
const { Command } = require('klasa')

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'dump',
      usage: '<users|channels|messages|emojis|guilds:default> [size|delete]',
      permissionLevel: 6,
    })
  }

  async run(msg) {
    const client = msg.client
    let list
    let nowrite
    if (args[1] === 'users') {
      list = client.users.map((user) => `${user.tag} (${user.id})`)
    } else if (args[1] === 'channels') {
      list = client.channels.map((channel) => `<${channel.guild.name}><${channel.guild.id}> ${channel.name} (${channel.id}) [${channel.type}]`)
    } else if (args[1] === 'messages') {
      if (args[2] === 'size') {
        const {size} = await fs.stat(`./data/servers/${msg.guild.id}/messages.log`)
        msg.channel.send(f(lang.COMMAND_DUMP_LOGSIZE, size / 1000000.0))
      } else if (args[2] === 'delete') {
        fs.writeFile(`${__dirname}/../../data/servers/${msg.guild.id}/messages.log`, `--- deleted messages by ${msg.author.tag} ---\n\n\n`, 'utf8')
      }
      nowrite = true
    } else if (args[1] === 'emojis') {
      list = client.emojis.map((emoji) => `<${emoji.guild.name}><${emoji.guild.id}> ${emoji.name} (${emoji.id}) [isAnimated:${emoji.animated}] [ ${emoji.url} ]`)
    } else if (!args[1] || args[1] === 'guilds') {
      list = client.guilds.map((guild) => `${guild.name} (${guild.id}) [ /servers/${guild.id}/messages.log ]`)
    }
    const image1 = 'https://img.rht0910.tk/upload/2191111432/72932264/bump.png'
    const image2 = 'https://img.rht0910.tk/upload/2191111432/710894583/dump2.png'
    const image = !args[2] ? image1 : image2
    const embed = new Discord.MessageEmbed().setImage(image)
      .setTitle(lang.COMMAND_DUMP_DUMPMESSAGE)
      .setColor([140,190,210])
      .setDescription(f(lang.COMMAND_DUMP_DUMPED, 'dump.txt'))
    msg.channel.send(embed)
    if (!nowrite) {
      fs.writeFile(__dirname + '/dump.txt', list.join('\n'), 'utf8')
    }
  }
}
