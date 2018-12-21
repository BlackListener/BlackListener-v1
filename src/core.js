const Command = require('./structures/Command')
const Component = require('./structures/Component')

const LoggerFactory = require('./structures/util/LoggerFactory')
const Logger = require('./structures/util/Logger')
const Converter = require('./structures/util/Converter')

const Discord = require('discord.js')

const f = require('string-format')
const _fs = require('fs')

const language = require('./language')
const contents = require('./contents')
const data = require('./data')
const argsresolver = require('./argument_parser')
const util = require('./util')
const register = require('./register')
const app = require('../config')
const package = require('../package.json')

const isTravisBuild = process.argv.includes('--travis-build')

module.exports = {
  Command,
  Component,

  LoggerFactory,
  Logger,
  Converter,

  Discord,

  commons: {
    contents,
    language,
    data,
    argsresolver,
    util,
    isTravisBuild,
    register,
    config: isTravisBuild ? require(__dirname + '/travis.yml') : require(__dirname + '/config.yml'),
    app,
    package,
    _fs,
    fs: _fs.promises,
    f: f,
    commands: {},
  },
}
