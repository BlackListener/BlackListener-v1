const IllegalStateException = require('../error/IllegalStateException')
const ds = require('./DataStore')
const fs = require('fs').promises

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
    data = JSON.parse(JSON.stringify(data))
    ds.storedData[file] = data
    if (ds.storedData.length >= 100) this.write()
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
      if (ds.storedData[Object.keys(ds.storedData)[i]]) await fs.writeFile(Object.keys(ds.storedData)[i], JSON.stringify(ds.storedData[Object.keys(ds.storedData)[i]], null, 4))
    }
    ds.storedData = []
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
    if(ds.storedData && ds.storedData[file]) {
      const json = JSON.parse(JSON.stringify(arr ? Object.assign({}, arr, ds.storedData[file]) : ds.storedData[file]))
      return json
    }
    return arr || {}
  }
}

module.exports = new ConfigStore()