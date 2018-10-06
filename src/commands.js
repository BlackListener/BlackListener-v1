const logger = require(__dirname + '/logger').getLogger('plugins', 'cyan')
const fs = require('fs')
const { Command } = require('./core')
const commands = {}

const files = fs.readdirSync(__dirname + '/commands/')

function setCommand(file, reload) {
  if (reload) delete require.cache[require.resolve(`./commands/${file}`)]
  const rawcommand = require(`./commands/${file}`)
  if (typeof rawcommand != 'function') return
  const command = new rawcommand()
  if (rawcommand instanceof Command) return
  commands[command.name] = command
  for (const alias of command.alias) {
    if (commands[alias] && !reload)
      logger.fatal(`The alias ${alias} is already used.`)
    commands[alias] = command
  }
}

for (const file of files) if (file.endsWith('.js')) setCommand(file)

module.exports = {
  commands,
  load(file) {
    setCommand(file, true)
  },
}
