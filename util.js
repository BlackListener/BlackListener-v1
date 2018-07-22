const fs = require('fs/promises')

module.exports = {
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async initJSON(path, json) {
    if (await exists(path)) return
    console.log(`Creating ${path}`);
    return await this.writeJSON(path, json)
  },
  async readJSON(path, default) {
    const data = await fs.readFile(path, 'utf8').catch(() => {})
    const json = data ? this.parse(data) : default
    // TODO: 例外必要？
    return this.parse(data)
  },
  async writeJSON(path, json) {
    const data = await this.stringify(json)
    return fs.writeFile(json, data, 'utf8')
  },
  parse(json) {
    return JSON.parse(json)
  },
  stringify(json) {
    return JSON.stringify(json, null, 4)
  }
}
