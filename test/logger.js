/* eslint-env mocha */
const assert = require('assert').strict
const LoggerFactory = require('../src/structures/util/LoggerFactory')
const logger = LoggerFactory.getLogger('test')

describe('Logger.js Return type', () => {
  it('debug Level', () => {
    assert.deepStrictEqual(typeof logger.debug('test'), typeof Logger)
  })
  it('info Level', () => {
    assert.deepStrictEqual(typeof logger.info('test'), typeof Logger)
  })
  it('warn Level', () => {
    assert.deepStrictEqual(typeof logger.warn('test'), typeof Logger)
  })
  it('error Level', () => {
    assert.deepStrictEqual(typeof logger.error('test'), typeof Logger)
  })
  it('fatal Level', () => {
    assert.deepStrictEqual(typeof logger.fatal('test'), typeof Logger)
  })
})
