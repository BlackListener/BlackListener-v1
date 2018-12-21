/* eslint-env mocha */
const assert = require('assert').strict

describe('Language files', () => {
  const languages = require('../src/language')
  it('All languages [Keys]', () => {
    Object.keys(languages).forEach(e => {
      assert.deepStrictEqual(typeof e, 'string')
    })
  })
})
