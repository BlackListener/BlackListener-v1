var str = process.argv[2];
console.log(`Encoded string: ` + Buffer.from(str).toString(`base64`));
