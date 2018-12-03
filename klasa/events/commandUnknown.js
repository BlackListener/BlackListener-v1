const { Event } = require('klasa')
const levenshtein = require('fast-levenshtein').get

module.exports = class extends Event {
  run(message, command) {
    const commandNames = [...this.client.commands.keys()]
    const commandList = commandNames.map(name => ({ name, len: levenshtein(command, name) }))
    const similarCommands = commandList.sort((a, b) => a.len - b.len).filter(cmd => cmd.len <= 2)
    const { prefix } = message.guildSettings
    const list = similarCommands.map(cmd => `・\`${prefix}${cmd.name}\``)
    message.sendLocale('EVENT_COMMANDUNKNOWN_UNKNOWN_COMMAND', [prefix, command])
    if (list.length) message.sendLocale('EVENT_COMMANDUNKNOWN_DIDYOUMEAN', [list.join('\n')])
  }
}
