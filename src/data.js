const util = require('./util')
const mongodb = require('mongodb') //eslint-disable-line
const {
  defaultSettings,
  defaultUser,
  defaultBans,
} = require('./contents')

/**
 * @type {mongodb.Db}
 */
let db

const queue = {}

const path = {
  user: id => `./data/users/${id}/config.json`,
  server: id => `./data/servers/${id}/config.json`,
  bans: () => './data/bans.json',
}

async function dataStoreDb(id, type, _default) {
  switch(type) {
    case 'servers': {
      const collection = db.collection(type)
      const array = await collection.find({}).toArray()
      const json = array[0] ? array[0][id] : {}
      if (array[0]) await collection.deleteOne({ '_id': mongodb.ObjectId(array[0].id_) })
      const predata = Object.assign(_default, json)
      const data = Object.assign(predata, queue[id])
      queue[id] = null
      await collection.insertOne({[id]: data})
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
          queue.push(obj)
          return true
        },
      })
    }
    case 'user': {
      console.log('')
      break
    }
    case 'bans': {
      console.log('')
      break
    }
    default: {
      throw new TypeError('Invalid Type Provided.')
    }
  }
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
    return await dataStoreDb(id, 'servers', defaultSettings)
  },
  async user(id) {
    return await dataStore(id, 'user', defaultUser)
  },
  async bans() {
    return await dataStore('', 'bans', defaultBans)
  },
  config(target) {
    db = target
  },
} 
