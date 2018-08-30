const YAML = require('yaml').default
const fs = require('fs')

require.extensions['.yml'] = function(module, filename) {
  module.exports = YAML.parse(fs.readFileSync(filename, 'utf8'))
}
