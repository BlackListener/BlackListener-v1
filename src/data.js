const {
  defaultServer,
  defaultUser,
  defaultBans,
} = require(__dirname + '/contents')
const DeepProxy = require('proxy-deep')
const MongoDB = require('./db')

/**
 * @type {MongoDB}
 */
const db = new MongoDB()
db.init()

async function dataStore(id, collection, _default) {
  const rawdata = await db.get(collection, { _id: id })
  const data = Object.assign(_default, rawdata)
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
      db.updateOne(collection, { _id: id }, this.rootTarget, null, { upsert: true })
      return true
    },
  })
}

module.exports = {
  async server(id) {
    return await dataStore(id, 'servers', defaultServer)
  },
  async user(id) {
    return await dataStore(id, 'users', defaultUser)
  },
  async bans() {
    return await dataStore('', 'bans', defaultBans)
  },
}

process.on('beforeExit', () => db.close())
