const util = require(__dirname + '/util')
const {
  defaultSettings,
  defaultUser,
  defaultBans,
} = require(__dirname + '/contents')
const DeepProxy = require('proxy-deep')
const mkdirp = require('mkdirp-promise')

const path = {
  user: id => `${__dirname}/../data/users/${id}/config.json`,
  server: id => `${__dirname}/../data/servers/${id}/config.json`,
  bans: () => __dirname + '/../data/bans.json',
}

async function dataStore(id, type, _default) {
  if (id !== '') {
    if (type === 'user') await mkdirp(`${__dirname}/../data/users/${id}`)
    if (type === 'server') await mkdirp(`${__dirname}/../data/servers/${id}`)
  }
  const json = await util.readJSON(path[type](id), {})
  const data = Object.assign(_default, json)
  return new DeepProxy(data, {
    get(target, key, receiver) {
      const val = Reflect.get(target, key, receiver)
      if (typeof val === 'object' && val !== null) {
        return this.nest(val)
      } else {
        return val
      }
    },
    set(target, key, value, receiver) {
      Reflect.set(target, key, value, receiver)
      util.writeJSON(path[type](id), this.rootTarget)
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
