'use strict';

const session = require('koa-session');
const sodium = require('sodium-native');

/**
 * Initialize session middleware with `opts`:
 *
 * - `secretKey` secret key for encryption
 * - `secret` secret passphrase for encryption
 * - `salt` salt for encryption
 * - all other options are passed as koa-session options
 *
 * @param {Object} [opts]
 * @param {Application} app, koa application instance
 * @public
 */
module.exports = function encryptedSession(opts, app) {
  if (!opts || typeof opts !== 'object') {
    throw new TypeError('opts required: `encryptedSession(opts, app)`');
  }

  if (!app || typeof app.use !== 'function') {
    throw new TypeError('app instance required: `encryptedSession(opts, app)`');
  }

  let secretKey;
  if (opts.secret) {
    if (Buffer.byteLength(opts.secret) < 32) {
      throw new Error('Invalid key length: opts.secret must be at least 32 bytes');
    }

    secretKey = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
    let salt = Buffer.from('r7bFNKlRQnpAjvuLawnvRQ==', 'base64');
    if (opts.salt) salt = (Buffer.isBuffer(opts.salt)) ? opts.salt : Buffer.from(opts.salt, 'ascii');
    if (Buffer.byteLength(salt) !== sodium.crypto_pwhash_SALTBYTES) {
      throw new Error('salt must be length ' + sodium.crypto_pwhash_SALTBYTES);
    }

    sodium.crypto_pwhash(secretKey,
      Buffer.from(opts.secret),
      salt,
      sodium.crypto_pwhash_OPSLIMIT_MODERATE,
      sodium.crypto_pwhash_MEMLIMIT_MODERATE,
      sodium.crypto_pwhash_ALG_DEFAULT);
  }

  if (opts.secretKey) {
    secretKey = opts.secretKey;
    if (typeof secretKey === 'string') {
      secretKey = Buffer.from(secretKey, 'base64');
    } else if (!(secretKey instanceof Buffer)) {
      throw new Error('secretKey must be a string or a Buffer');
    }

    if (secretKey.length < sodium.crypto_secretbox_KEYBYTES) throw new Error(`secretKey must be at least ${sodium.crypto_secretbox_KEYBYTES} bytes`);
  }

  if (!secretKey) throw new Error('secretKey or secret must specified');

  // disable cookie signing
  opts.signed = false;

  opts.decode = cookie => {
    const split = decodeURIComponent(cookie).split(';');
    const cyphertextB64 = split[0];
    const nonceB64 = split[1];

    if (split.length <= 1) throw new SyntaxError('the cookie is malformed');

    const cipher = Buffer.from(cyphertextB64, 'base64');
    const nonce = Buffer.from(nonceB64, 'base64');
    if (cipher.length < sodium.crypto_secretbox_MACBYTES) throw new SyntaxError('not long enough');

    const msg = Buffer.allocUnsafe(cipher.length - sodium.crypto_secretbox_MACBYTES);
    if (!sodium.crypto_secretbox_open_easy(msg, cipher, nonce, secretKey)) throw new SyntaxError('unable to decrypt');

    return JSON.parse(msg);
  };

  opts.encode = session => {
    const nonce = Buffer.allocUnsafe(sodium.crypto_secretbox_NONCEBYTES);
    sodium.randombytes_buf(nonce);
    const msg = Buffer.from(JSON.stringify(session));

    const cipher = Buffer.allocUnsafe(msg.length + sodium.crypto_secretbox_MACBYTES);
    sodium.crypto_secretbox_easy(cipher, msg, nonce, secretKey);

    return encodeURIComponent(cipher.toString('base64') + ';' + nonce.toString('base64'));
  };

  return session(opts, app);
};
