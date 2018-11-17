class IllegalStateError extends Error {
  constructor(message, extra) {
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
    this.extra = extra
  }
}

module.exports = IllegalStateError
