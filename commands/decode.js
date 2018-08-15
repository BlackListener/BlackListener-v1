module.exports = function(msg, str) {return msg.channel.send(new Buffer.from(str, 'base64').toString('ascii')) }
