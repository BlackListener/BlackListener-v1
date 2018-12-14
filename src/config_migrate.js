const fs = require('fs').promises
const YAML = require(__dirname + '/yaml')
const config = require(__dirname + '/config.yml')

module.exports = {
  missingno: ['1.0.2'],
  versions: {
    '1.0-to-1.0.1': async () => {
      config.config_version = '1.0.1'
      delete config.talk_apikey
      config.youtube_apikey = 'Your YouTube Data API key'
      await fs.writeFile(__dirname + '/config.yml', YAML.stringify(config))
      return true
    },
    '1.0.1-to-1.0.3': async () => {
      config.config_version = '1.0.3'
      config.version = '2.0.0'
      config.errors_channel = null
      config.crashes_channel = null
      delete config.inviteme
      await fs.writeFile(__dirname + '/config.yml', YAML.stringify(config))
      return false
    },
  },
}
