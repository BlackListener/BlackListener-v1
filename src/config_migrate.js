const fs = require('fs').promises
const YAML = require(__dirname + '/yaml')
const config = require(__dirname + '/config.yml')
const write = async _ => await fs.writeFile(__dirname + '/config.yml', YAML.stringify(_))

module.exports = {
  missingno: ['1.0.2'],
  versions: {
    '1.0-to-1.0.1': async () => {
      config.config_version = '1.0.1'
      delete config.talk_apikey
      config.youtube_apikey = 'Your YouTube Data API key'
      await write(config)
      return true
    },
    '1.0.1-to-1.0.3': async () => {
      config.config_version = '1.0.3'
      config.version = '2.0.0'
      config.errors_channel = null
      config.crashes_channel = null
      delete config.inviteme
      await write(config)
      return false
    },
    '1.0.3-to-1.0.4': async () => {
      config.config_version = '1.0.4'
      delete config.logger
      config.debug = false
      await write(config)
      return false
    },
  },
}
