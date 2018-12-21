const { commons: { f }, Component, Converter } = require('../../core')

module.exports = class extends Component {
  constructor() {
    const opts = {
      args: ['remove', 'add', '<empty>'],
      permission: 8,
    }
    super('autorole', opts)
  }

  _run(msg, settings, lang, args) {
    if (args[1] === 'remove') {
      settings.autorole = null
    } else if (args[1] === 'add') {
      const role = Converter.toRole(msg, args[2])
      if (!role) return msg.channel.send(lang.invalid_args)
      settings.autorole = role.id
    } else {
      const _ = ` (Available args: \`${this.args.join(', ')}\`)`
      if (!settings.autorole != null) return msg.channel.send(lang.autorole_disabled+_)
      return msg.channel.send(f(lang.autorole_enabled, msg.guild.roles.get(settings.autorole).name)+_)
    }
    msg.channel.send(f(lang.setconfig, 'autorole'))
  }
}
