/* eslint-disable */
const assert = require('assert').strict

describe('Language files', () => {
  const languages = require('../src/language')
  it('All languages [Keys]', () => {
    Object.keys(languages).forEach(e => {
      assert.deepStrictEqual(typeof e, 'string')
    })
  })
  it('All languages [Values]', () => {
    Object.values(languages).forEach(e => {
      assert.deepStrictEqual(typeof e, 'object')
    })
  })
})