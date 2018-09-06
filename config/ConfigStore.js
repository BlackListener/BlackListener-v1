const IllegalStateException = require('../error/IllegalStateException')
const ds = require('./DataStore')
const fs = require('fs').promises
const YAML = require('yaml')

/**
 * Data caching
 */
class ConfigStore {
  constructor() {
    if (!ds.initialized) throw new IllegalStateException('Initialization state is false.')
    ds.storedData = []
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
  store(file, data) {
    try {
      ds.storedData[file] = YAML.parse(data)
    } catch(justignore) {/*ignore*/} finally {
      if (ds.storedData.length >= 100) this.write()
    }
  }

  /**
   * Write all stored data to disk.
   * 
   * This function is async.
   * 
   * @returns {void} <void>
   */
  async write() {
    for (let i=0, len = Object.values(ds.storedData).length; i<=len; i++) {
      console.log(Object.keys(ds.storedData)[i] + ': ' + YAML.stringify(ds.storedData[Object.keys(ds.storedData)[i]], null, 4))
      /*                                                      ^^^^^^^^^
       * 2018-8-5 14:36:52.410 main:event error TypeError: YAML.stringify is not a function
       * at ConfigStore.write (C:\Users\frand\Documents\BlackListener\config\ConfigStore.js:41:63)
       * at Object.module.exports.run [as save] (C:\Users\frand\Documents\BlackListener\commands\save.js:11:6)
       * at module.exports (C:\Users\frand\Documents\BlackListener\dispatcher.js:16:22)
       * at Client.client.on (C:\Users\frand\Documents\BlackListener\client\index.js:155:5)
       */
      if (ds.storedData[Object.keys(ds.storedData)[i]]) await fs.writeFile(Object.keys(ds.storedData)[i], YAML.stringify(ds.storedData[Object.keys(ds.storedData)[i]], null, 4))
    }
    ds.storedData = []
  }

  /**
   * Use stored data
   * 
   * @param {string} file Path of file
   * @param {JSON} arr
   * 
   * @returns {JSON} Merged array
   */
  use(file, arr = null) {
    if(ds.storedData && ds.storedData[file]) {
      const json = YAML.parse(JSON.stringify(Object.assign({}, arr, ds.storedData[file])))
      return json
    }
    return arr
  }
}

module.exports = new ConfigStore()