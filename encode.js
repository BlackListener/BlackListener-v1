const str = process.argv[2]
console.log('Encoded string: ' + Buffer.from(Buffer.from(Buffer.from(str).toString('base64')).toString('base64')).toString('base64'))
