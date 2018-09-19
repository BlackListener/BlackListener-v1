const util = require('./util')
const {
  defaultSettings,
  defaultUser,
  defaultBans,
} = require('./contents')

const path = {
  user: id => `./data/users/${id}/config.json`,
  server: id => `./data/servers/${id}/config.json`,
  bans: () => './data/bans.json',
}

async function dataStore(id, type, _default) {
  const json = await util.readJSON(path[type](id), {})
  const data = Object.assign(_default, json)
  return new Proxy(data, {
    get(target, key) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], this)
      } else {
        return target[key]
      }
    },
    async set(obj, prop, value) {
      if (obj[prop] === value) return true
      obj[prop] = value
      await util.writeJSON(path[type](id), obj)
      return true
    },
  })
}

module.exports = {
  async server(id) {
    return await dataStore(id, 'server', defaultSettings)
  },
  async user(id) {
    return await dataStore(id, 'user', defaultUser)
  },
  async bans() {
    return await dataStore('', 'bans', defaultBans)
  },
} 
