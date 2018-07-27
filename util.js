const fs = require('fs').promises

module.exports = {
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async initJSON(path, json) {
    if (await this.exists(path)) return
    console.log(`Creating ${path}`);
    return await this.writeJSON(path, json)
  },
  async readJSON(path, _default) {
    const data = await fs.readFile(path, 'utf8').catch(() => {})
    return data ? this.parse(data) : _default
  },
  async writeJSON(path, json) {
    const data = this.stringify(json)
    return fs.writeFile(path, data, 'utf8')
  },
  parse(json) {
    return JSON.parse(json)
  },
  stringify(json) {
    return JSON.stringify(json, null, 4)
  }
}
