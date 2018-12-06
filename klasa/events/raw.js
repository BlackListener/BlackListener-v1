const { Event } = require('klasa')

module.exports = class extends Event {
  run(packet) {
    if (packet.op !== 0) return
    const provider = this.client.providers.get('mongodb')
    provider.create('log', '', packet.d)
  }
}
