const { Command, Discord, Logger, Converter } = require('../core')
const logger = Logger.getLogger('commands:role')

module.exports = class extends Command {
  constructor() {
    const opts = {
      args: [
        '<Role> [User]',
      ],
      permission: 8,
    }
    super('role', opts)
  }

  run(msg, settings, lang, args) {
    const role = Converter.toRole(args[1])
    const member = Converter.toMember(msg, args[2])
    const build = (title, message) => {
      const embed = new Discord.RichEmbed()
        .setTitle(title)
        .setColor([255,0,0])
        .setDescription(lang.role.role + ' ``' + args[1] + '`` ' + message)
      msg.channel.send(embed)
    }
    if (member.roles.has(role.id)) {
      member.removeRole(role).catch(e => logger.error(e))
      build(':x: ' + lang.role.title_removed, ' ' + lang.role.role_removed)
    } else {
      member.addRole(role).catch(e => logger.error(e))
      build(':white_check_mark: ' + lang.role.title_removed, ' ' + lang.role.role_added)
    }
  }
}
