const logger = require(__dirname + '/logger').getLogger('plugins', 'cyan')
const fs = require('fs')
const { Command } = require('./core')
console.log(new (require(__dirname + '/commands/eval'))())
const commands = {}

const files = fs.readdirSync(__dirname + '/commands/')

function setCommand(file, reload) {
  if (reload) delete require.cache[require.resolve(`./commands/${file}`)]
  const rawcommand = require(`./commands/${file}`)
  if (typeof rawcommand != typeof Command) return
  const command = new rawcommand()
  commands[command.name] = command
  if (!command.alias) return
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
