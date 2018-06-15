var str = process.argv[2];
console.log(`Encrypted string: ` + Buffer.from(str).toString(`base64`));
