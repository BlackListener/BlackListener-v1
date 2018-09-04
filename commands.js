const fs = require('fs')
const IllegalStateException = require('./error/IllegalStateException')

const commands = {}

const files = fs.readdirSync('./commands/')

for (const file of files) {
  if (!file.endsWith('.js')) continue
  const command = require(`./commands/${file}`)
  commands[command.name] = command.run
  if (!command.alias) continue
  for (const alias of command.alias) {
<<<<<<< HEAD
    if (commands[alias]) throw new IllegalStateException(`The alias ${alias} is already used.`)
=======
    if (commands[alias]) logger.fatal(`The alias ${alias} is already used.`)
>>>>>>> 4508b68... bug fix
    commands[alias] = command.run
  }
}

module.exports = commands
