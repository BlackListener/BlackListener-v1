/* eslint-env mocha */
const assert = require('assert').strict

describe('Argument parser', () => {
  const parser = require('../src/argument_parser')
  it('--debug=test', () => {
    const result = parser(['--debug=test'])
    assert.deepStrictEqual(result.debug['test'], true)
  })
  it('--enable-test', () => {
    const result = parser(['--enable-test'])
    assert.deepStrictEqual(result['test'], true)
  })
  it('--disable-test', () => {
    const result = parser(['--disable-test'])
    assert.deepStrictEqual(result['test'], false)
  })
  it('--prefix=c++', () => {
    const result = parser(['--prefix=c++'])
    assert.deepStrictEqual(result['prefix'], 'c++')
  })
})
