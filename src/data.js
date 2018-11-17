const {
  defaultServer,
  defaultUser,
  defaultBans,
} = require(__dirname + '/contents')
const DeepProxy = require('proxy-deep')
const MongoDB = require(__dirname + '/db') //eslint-disable-line

/**
 * @type {MongoDB}
 */
let mongo

async function dataStore(id, type, _default) {
  let collection
  switch(type) {
    case 'bans': collection = 'bans'; break
    case 'server': collection = 'servers'; break
    case 'user': collection = 'users'; break
  }
  const rawdata = await mongo.get(collection, { id: id })
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
      mongo.updateOne(collection, { id: id }, { [id]: this.rootTarget })
      return true
    },
  })
}

module.exports = {
  async server(id) {
    return await dataStore(id, 'server', defaultServer)
  },
  async user(id) {
    return await dataStore(id, 'user', defaultUser)
  },
  async bans() {
    return await dataStore('', 'bans', defaultBans)
  },
  config(db) {
    mongo = db
  },
}
