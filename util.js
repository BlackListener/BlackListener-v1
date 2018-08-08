const _fs = require('fs')
const fs = _fs.promises
const logger = require('./logger')

module.exports = {
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async initJSON(path, json) {
    if (await this.exists(path)) return
    logger.log(`Creating ${path}`)
    return await this.writeJSON(path, json)
  },
  async readJSON(path, _default) {
    return await fs.readFile(path, 'utf8')
      .then(data => this.parse(data))
      .catch(err => _default ? null : err)
  },
  async writeJSON(path, json) {
    const data = this.stringify(json)
    return fs.writeFile(path, data, 'utf8')
  },
  readJSONSync(path, _default) {
    const data = _fs.readFileSync(path, 'utf8')
    return this.parse(data)
  },
  writeJSONSync(path, json) {
    const data = this.stringify(json)
    _fs.writeFileSync(path, data, 'utf8')
  },
  parse(json) {
    return JSON.parse(json)
  },
  stringify(json) {
    return JSON.stringify(json, null, 4)
  },
}
