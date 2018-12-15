const fs = require('fs').promises
const YAML = require(__dirname + '/yaml')
const config = require(__dirname + '/config.yml')

const write = async (c) => await fs.writeFile(__dirname + '/config.yml', YAML.stringify(c))

module.exports = {
  versions: {
    '1.0-to-1.0.1': async () => {
      config.config_version = '1.0.1'
      delete config.talk_apikey
      config.youtube_apikey = 'Your YouTube Data API key'
      await write(config)
      return true // Is restart and/or review needed?
    },
  },
}
