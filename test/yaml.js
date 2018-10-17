/* eslint-env mocha */
const assert = require('assert').strict

describe('YAML', () => {
  it('YAML Test', () => {
    const yaml = require(__dirname + '/../src/yaml')
    const YAML = require('yaml')
    assert.deepStrictEqual(yaml, YAML)
  })
  it('YAML Loading Test', () => {
    require(__dirname + '/../src/yaml')
    const data = require(__dirname + '/files/test.yml')
    assert.deepStrictEqual(data.string, 'string')
    assert.deepStrictEqual(data.number_zero, 0)
    assert.deepStrictEqual(data.bool_true, true)
  })
})
