const EventEmitter = require('events').EventEmitter
class ShutdownPacketListener extends EventEmitter {
  constructor(client) {
    super()
    this.client = client
    return this
  }
  received(logger, rl) {
    logger.info('Packet received, Shutting down!')
    for (const i in clients){
      const socket = clients[i].socket
      socket.end()
    }
    server.close()
    rl.close()
    this.client.destroy()
    process.nextTick(() => {
      this.emit('received')
    })
  }
}
//util.inherits(ShutdownPacketListener, EventEmitter)

const logger = require('./logger').getLogger('ShutdownPacketListener', 'red')
const net = require('net')
const readline = require('readline')

const server = net.createServer()
server.maxConnections = 1

function Client(socket){
  this.socket = socket
}

Client.prototype.writeData = function(){
}

const clients = {}

server.on('connection', (socket) => {
  if (socket.writable){
    socket.write('[Server] Shutting down, you are being logged.\n')
  }
  logger.warn(`Triggered shutdown by ${socket.remoteAddress}`)
  new ShutdownPacketListener().received(logger, rl)
  //const status = server.getConnections.length + '/' + server.maxConnections
  const key = socket.remoteAddress + ':' + socket.remotePort
  clients[key] = new Client(socket)
})

server.on('connection', (socket) => {
  let data = ''
  const newline = /\r\n|\n/
  socket.on('data', (chunk) => {
    data += chunk.toString()
    const key = socket.remoteAddress + ':' + socket.remotePort
    if(newline.test(data)){
      clients[key].writeData(data)
      data = ''
    }
  })
})

server.on('connection', (socket) => {
  const key = socket.remoteAddress + ':' + socket.remotePort
  socket.on('end', () => {
    //const status = server.getConnections.length + '/' + server.maxConnections
    delete clients[key]
  })
})

server.on('close', () => {
  logger.info('Server Closed')
})

server.listen(5123, '127.0.0.1', () => {
  const addr = server.address()
  logger.info('Listening Start on Server - ' + addr.address + ':' + addr.port)
})

const rl = readline.createInterface(process.stdin, process.stdout)
rl.on('SIGINT', () => {
  for(const i in clients){
    const socket = clients[i].socket
    socket.end()
  }
  server.close()
  rl.close()
})

module.exports = function(client) {
  return new ShutdownPacketListener(client)
}
