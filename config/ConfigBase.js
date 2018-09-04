const ds = require('./DataStore')

class ConfigBase {
  constructor() {
    ds.initialized = true
  }
}

module.exports = ConfigBase
