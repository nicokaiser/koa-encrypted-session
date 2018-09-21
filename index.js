'use strict';

const base64url = require('base64url');
const crypto = require('crypto');
const session = require('koa-session');

/**
 * Initialize session middleware with `opts`:
 *
 * - `secret` secret key for encryption
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

  // secret required
  if (!opts.secret || opts.secret.length !== 32) {
    throw new Error('Invalid key length: opts.secret must be 32 bytes');
  }

  if (opts.signed !== true) opts.signed = false;

  /**
   * Decode the encrypted cookie value to an object.
   *
   * @param {String} string
   * @return {Object}
   * @private
   */
  opts.encode = function encode(body) {
    const header = { alg: 'dir', enc: 'A256GCM' };
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', opts.secret, iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(body)),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();

    const result = [
      base64url.encode(JSON.stringify(header)),
      '', // key
      base64url.encode(iv),
      base64url.encode(ciphertext),
      base64url.encode(tag)
    ].join('.');

    return result;
  };

  /**
   * Encode an object into an encrypted JSON string.
   *
   * @param {Object} body
   * @return {String}
   * @private
   */
  opts.decode = function decode(string) {
    const components = string.split('.');
    if (components.length !== 5) return undefined;

    try {
      const header = JSON.parse(base64url.decode(components[0]));
      if (header.alg !== 'dir' || header.enc !== 'A256GCM') return undefined;

      const iv = base64url.toBuffer(components[2]);
      const ciphertext = base64url.toBuffer(components[3]);
      const tag = base64url.toBuffer(components[4]);

      const cipher = crypto.createDecipheriv('aes-256-gcm', opts.secret, iv);
      cipher.setAuthTag(tag);
      const plaintext = cipher.update(ciphertext, 'binary', 'utf8') + cipher.final('utf8');

      return JSON.parse(plaintext);
    } catch (ignored) {
      // ignore
    }

    return undefined;
  };

  return session(opts, app);
};
