/* eslint-env mocha */
const assert = require('assert').strict
const share = require('../src/share')

describe('share.js', () => {
  it('thread [Get]', () => {
    share.thread = '' // First, we need reset value(value is edited by logger test)
    assert.deepStrictEqual(share.thread, '')
  })
  it('thread [Set]', () => {
    share.thread = false
    assert.deepStrictEqual(share.thread, false)
  })
})
