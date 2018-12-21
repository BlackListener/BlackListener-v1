/* eslint-env mocha */
const assert = require('assert').strict
const LoggerFactory = require('../src/structures/util/LoggerFactory')
const logger = LoggerFactory.getLogger('test')

describe('Logger.js Return type', () => {
  it('debug Level', () => {
    assert.deepStrictEqual(typeof logger.debug('test'), 'object')
  })
  it('info Level', () => {
    assert.deepStrictEqual(typeof logger.info('test'), 'object')
  })
  it('warn Level', () => {
    assert.deepStrictEqual(typeof logger.warn('test'), 'object')
  })
  it('error Level', () => {
    assert.deepStrictEqual(typeof logger.error('test'), 'object')
  })
  it('fatal Level', () => {
    assert.deepStrictEqual(typeof logger.fatal('test'), 'object')
  })
})
