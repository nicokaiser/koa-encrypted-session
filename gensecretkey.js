#! /usr/bin/env node

const sodium = require('sodium-native');

const buf = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
sodium.randombytes_buf(buf);
console.log(buf.toString('base64'));
