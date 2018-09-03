const ConfigBase = require('./ConfigBase')
//const fs = require('fs').promises

/**
 * Data caching
 */
class ConfigStore extends ConfigBase {
  constructor() {
    super()
    this.stored = []
  }

  /**
   * Store a data.
   * 
   * You can store data only one at once.
   * 
   * @param {string} file: Path of file
   * @param {JSON} data: JSON Data(do not JSON.stringify())
   * @returns {void} <void>
   */
  store(file, data) { // 1-1. Run <prefix>language ja // 2-1. Run <prefix>setprefix a-
    this.stored[file] = data // 1-2. Store data // 2-2. Store data
    console.log('stored:' + JSON.stringify(this.stored[file]))
    // 1-3. Expected: ... "language":"ja", ...
    // 2-3. Expected: {"prefix":"a-", ...
  }

  /**
   * Write all stored data to disk.
   * 
   * This function is async.
   * 
   * Called on save command or auto save.
   * 
   * @returns {void} <void>
   */
  write() {
    console.log(JSON.stringify(Object.values(this.stored)))
    // 1-4. expected data: ... "language":"ja", ...
    // 1-5. but it returns unexpected data: ... "language":"en", ...
    // 2-4. expected data: {"prefix":"a-", ...
    // 2-5. but it returns unexpected data: {"prefix":"a:", ...
    for (let i=0; i<=Object.keys(this.stored).length; i++) {
      if (this.stored[Object.keys(this.stored)[i]]) console.log(JSON.stringify(this.stored[Object.keys(this.stored)[i]]))
      // 1-6, 2-6. If returned expected value, please write "fs.writeFile(...)"
    }
  }

  /**
   * Use stored data
   * 
   * @param {string} file Path of file
   * @param {JSON} arr optional
   * 
   * @returns {JSON} Merged array
   */
  use(file, arr = null) {
    if(this.stored && this.stored[file]) {
      return arr ? Object.assign({}, this.stored[file], arr) : this.stored[file]
    }
    return arr ? arr : {}
  }
}

module.exports = new ConfigStore()