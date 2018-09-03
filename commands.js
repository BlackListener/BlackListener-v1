const logger = require('./logger').getLogger('plugins', 'cyan')
const fs = require('fs')

const commands = {}

const files = fs.readdirSync('./commands/')

for (const file of files) {
  if (!file.endsWith('.js')) continue
  const command = require(`./commands/${file}`)
  commands[command.name] = command.run
  if (!command.alias) continue
  for (const alias of command.alias) {
    if (commands[alias]) logger.fatal(`The alias ${alias} is already used.`)
    commands[alias] = command
  }
}

module.exports = commands
