const logger = require(__dirname + '/logger').getLogger('ShutdownPacketListener')
const server = require('net').createServer()
const client = require('.')

server.maxConnections = 1

server.on('connection', (socket) => {
  if (socket.writable) socket.write('[Server] Shutting down, you are being logged.\n')
  logger.warn(`Triggered shutdown by ${socket.remoteAddress}`)
  logger.info('Packet received, Shutting down!')
  socket.end()
  server.close()
  client.destroy()
})

server.on('close', () => logger.info('Server Closed'))

server.listen(5123, '127.0.0.1', () => {
  const addr = server.address()
  logger.info('Listening Start on Server - ' + addr.address + ':' + addr.port)
})
