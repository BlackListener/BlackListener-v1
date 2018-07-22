const fs = require('fs').promises; // <- Cannot find module fs/promises [fixed]

module.exports = {
  async exists(path) {
    return await fs.access(path).then(() => true).catch(() => false)
  },
  async initJSON(path, json) {
    if (await this.exists(path)) return // <- exists is not defined (x3) [fixed] but.............
    console.log(`Creating ${path}`);
    return await this.writeJSON(path, json)
  },
  async readJSON(path, default2) { // <- Unexpected token `default` [fixed]
    const data = await fs.readFile(path, 'utf8').catch(() => {})
    const json = data ? this.parse(data) : default2 // <- Unexpected token `default` [fixed]
    // TODO: 例外必要？
    return this.parse(data)
  },
  async writeJSON(path, json) {
    const data = await this.stringify(json)
    return fs.writeFile(path, data, 'utf8')
  },
  parse(json) {
    return JSON.parse(json)
  },
  stringify(json) {
    return JSON.stringify(json, null, 4)
  }
}
