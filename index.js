'use strict';

const session = require('koa-session');
const sodium = require('sodium-native');

/**
 * Initialize session middleware with `opts`:
 *
 * - `secret` secret key for encryption
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

  if (!opts.secret || Buffer.byteLength(opts.secret) < 32) {
    throw new Error('Invalid key length: opts.secret must be at least 32 bytes');
  }

  const key = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
  let salt = Buffer.from('r7bFNKlRQnpAjvuLawnvRQ==', 'base64');
  if (opts.salt) salt = (Buffer.isBuffer(opts.salt)) ? opts.salt : Buffer.from(opts.salt, 'ascii');
  if (Buffer.byteLength(salt) !== sodium.crypto_pwhash_SALTBYTES) {
    throw new Error('salt must be length ' + sodium.crypto_pwhash_SALTBYTES);
  }

  sodium.crypto_pwhash(key,
    Buffer.from(opts.secret),
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT);

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
    if (!sodium.crypto_secretbox_open_easy(msg, cipher, nonce, key)) throw new SyntaxError('unable to decrypt');

    return JSON.parse(msg);
  };

  opts.encode = session => {
    const nonce = Buffer.allocUnsafe(sodium.crypto_secretbox_NONCEBYTES);
    sodium.randombytes_buf(nonce);
    const msg = Buffer.from(JSON.stringify(session));

    const cipher = Buffer.allocUnsafe(msg.length + sodium.crypto_secretbox_MACBYTES);
    sodium.crypto_secretbox_easy(cipher, msg, nonce, key);

    return encodeURIComponent(cipher.toString('base64') + ';' + nonce.toString('base64'));
  };

  return session(opts, app);
};
