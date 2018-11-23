const mongodb = require('mongodb')
const config = require(__dirname + '/config.yml')
const logger = require(__dirname + '/logger').getLogger('MongoDB')
const IllegalStateError = require(__dirname + '/error/IllegalStateError')

/**
 * Represents the MongoDB Functions and Client.
 */
class MongoDb {
  /**
   * @typedef document
   * @type {object}
   */

  /**
   * Initializes MongoDB Client.
   *
   * @throws IllegalStateError - when already initialized
   * @throws TypeError - configuration is missing
   */
  async init() {
    if (this.initialized) throw new IllegalStateError('Already initialized!')
    if (!config['db_host'] || !config['db_name'])
      throw new TypeError('One or more configuration is missing.')
    this.client = await mongodb.MongoClient.connect('mongodb://'+config['db_host']+':'+(config['db_port'] || '27017'), { useNewUrlParser: true })
    this.db = await this.client.db(config['db_name'])
    this.dbcollections = await this.db.collections()

    /**
     * @type {Array<mongodb.Collection<any>>}
     */
    this.collections = {}
    this.collections['servers'] = this.db.collection('servers')
    this.collections['users'] = this.db.collection('users')
    this.collections['bans'] = this.db.collection('bans')
    this.initialized = true
  }

  /**
   * Insert one document.
   * @param {string|document} nameOrObj
   * @param {document} value
   *
   * @throws IllegalStateError - when not initialized
   * @throws TypeError - unexpected document type
   */
  async insertOne(collection, nameOrObj, value) {
    if (!this.initialized) throw new IllegalStateError('Client is not initialized!')
    if (!Object.keys(this.collections).includes(collection))
      throw new ReferenceError('Collection ' + collection + ' is not defined')
    if (typeof nameOrObj === 'object') {
      return await this.collections[collection].insertOne(nameOrObj)
    } else if (typeof nameOrObj === 'string') {
      return await this.collections[collection].insertOne({[nameOrObj]: value})
    } else throw new TypeError('Unexpected document type: ' + typeof nameOrObj)
  }

  /**
   * Update one document.
   * @param {document} filter
   * @param {string|document} nameOrObj
   * @param {document} value
   *
   * @throws IllegalStateError - when not initialized
   * @throws TypeError - unexpected document type
   * @returns {Promise<mongodb.UpdateWriteOpResult>}
   */
  async updateOne(collection, filter = {}, nameOrObj, value, options) {
    if (!this.initialized) throw new IllegalStateError('Client is not initialized!')
    if (!Object.keys(this.collections).includes(collection))
      throw new ReferenceError('Collection ' + collection + ' is not defined')
    if (typeof nameOrObj === 'object') {
      //return await this.collections[collection].updateOne(filter, { $set: nameOrObj }, options)
      return await this.collections[collection].save(nameOrObj)
    } else if (typeof nameOrObj === 'string') {
      //return await this.collections[collection].updateOne(filter, { $set: {[nameOrObj]: value}}, options)
      return await this.collections[collection].save({[nameOrObj]: value})
    } else throw new TypeError('Unexpected document type: ' + typeof nameOrObj)
  }

  /**
   * Get document with {query}.
   * @param {document} query
   * @returns {Promise<any>}
   */
  async get(collection, query = null) {
    if (!this.initialized) throw new IllegalStateError('Client is not initialized!')
    if (!Object.keys(this.collections).includes(collection))
      throw new ReferenceError('Collection ' + collection + ' is not defined')
    return await this.collections[collection].findOne(query)
  }

  /**
   * Get multi iterable document with {query}.
   * @param {document} query
   * @returns {Promise<any>}
   */
  async getMulti(collection, query = null) {
    if (!this.initialized) throw new IllegalStateError('Client is not initialized!')
    if (!Object.keys(this.collections).includes(collection))
      throw new ReferenceError('Collection ' + collection + ' is not defined')
    return await this.collections[collection].find(query)
  }

  /**
   * Closes database connection.
   *
   * @throws IllegalStateError - when not initialized
   * @returns {Promise<void>}
   */
  async close() {
    if (!this.initialized) logger.error('Client is not initialized!')
    return await this.client.close()
  }
}

module.exports = MongoDb
