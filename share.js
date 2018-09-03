const share = {
  _thread: '',
  _logger: {},
  get thread() {
    return this._thread
  },
  get logger() {
    return this._logger
  },
}

module.exports = share