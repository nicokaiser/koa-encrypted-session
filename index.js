'use strict';

const session = require('koa-session');

const util = require('./lib/util');

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

  opts.decode = string => util.decode(string, opts.secret);
  opts.encode = body => util.encode(body, opts.secret);

  return session(opts, app);
};
