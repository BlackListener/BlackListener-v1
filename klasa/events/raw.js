const { Event } = require('klasa')

module.exports = class extends Event {
  run(packet) {
    if (!this.client.ready) return
    if (packet.op !== 0) return
    this.provider.create(packet.t, packet.d)
  }

  init() {
    this.provider = this.client.providers.get('logger')
  }
}
