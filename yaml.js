const YAML = require('yaml').default
const fs = require('fs')

require.extensions['.yml'] = function(module, filename) {
  YAML.parse(fs.readFileSync(filename, 'utf8'))
}

module.exports = YAML
