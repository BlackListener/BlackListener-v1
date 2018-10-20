const fs = require('fs').promises
const YAML = require(__dirname + '/yaml')
const config = require(__dirname + '/config.yml')

module.exports = {
  versions: {
    '1.0-to-1.0.1': async () => {
      config.config_version = '1.0.1'
      delete config.talk_apikey
      config.youtube_apikey = 'Your YouTube Data API key'
      await fs.writeFile(__dirname + '/config.yml', YAML.stringify(config))
      return true
    },
  },
}
