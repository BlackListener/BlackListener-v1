const { Client } = require('klasa')
const { config } = require('./config')
const env = require('dotenv-safe').config({allowEmptyValues: true})

Client.defaultPermissionLevels
  .add(6, (client, message) => message.guild && message.member.permissions.has('ADMINISTRATOR'), { fetch: true })

class BlackListenerClient extends Client {

  constructor(...args) {
    super(...args)

    // Add any properties to your Klasa Client
  }

  // Add any methods to your Klasa Client

}

new BlackListenerClient(config).login(env.parsed.TOKEN)
