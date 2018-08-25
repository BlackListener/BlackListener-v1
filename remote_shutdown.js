const net = require('net');
let retry = 0;
let options = {};
options.host = process.argv[2] ? process.argv[2] : "127.0.0.1";
options.port = process.argv[3] ? process.argv[3] : "5123";

let client = net.connect(options);

client.on('error', function(e){
  console.log('Connection Failed - ' + options.host + ':' + options.port);
  console.error(e.message);
  console.error('Can\'t connect. Server is down or not enabled rcon.')
});

client.on('connect', function(){
  console.log('Connected - ' + options.host + ':' + options.port);
});

process.on('SIGINT', function(){
  console.log('Connetion Closed -' + options.host + ':' + options.port);
  client.end();
  process.exit();
});

client.on('data', function(chunk){
  process.stdout.write(chunk.toString());
});

client.on('end', function(had_error){
  client.setTimeout(0);
  console.log('Connetion End - ' + options.host + ':' + options.port);
});

client.on('close', function(){
  console.log('Client Closed');
});
