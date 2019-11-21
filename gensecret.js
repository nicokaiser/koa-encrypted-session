const sodium = require('sodium-native');

const salt = Buffer.alloc(sodium.crypto_pwhash_SALTBYTES);
const key = sodium.sodium_malloc(32);

sodium.randombytes_buf(salt);
sodium.randombytes_buf(key);

console.log(`secret: Buffer.from('${key.toString('base64')}', 'base64')`);
console.log(`salt: Buffer.from('${salt.toString('base64')}', 'base64')`);
