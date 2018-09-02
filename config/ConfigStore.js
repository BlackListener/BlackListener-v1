const config = require('../config.yml')
const ConfigStore = require('./ConfigBase');
const fs = require('fs').promises

class ConfigStore extends ConfigBase {
  constructor() {
    super();
  }

  /**
   * Store a data.
   * You can store data only one at once.
  **/
  store(file, data) {
    this.stored.push({file: data});
    if (Object.keys(this.stored).length >= config.configStore.storeLimit) this.write();
  }

  /**
   * Write all stored data to disk.
   * This function is async.
  **/
  async write() {
    this.stored.forEach(async (file, data) => {
    });
  }
}
