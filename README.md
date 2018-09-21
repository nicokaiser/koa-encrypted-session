# koa-encrypted-session

[![NPM version][npm-image]][npm-url]
[![David deps][david-image]][david-url]

[npm-image]: https://img.shields.io/npm/v/koa-encrypted-session.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-encrypted-session
[david-image]: https://img.shields.io/david/nicokaiser/koa-encrypted-session.svg?style=flat-square
[david-url]: https://david-dm.org/nicokaiser/koa-encrypted-session
[download-image]: https://img.shields.io/npm/dm/koa-encrypted-session.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-encrypted-session

Encrypted session middleware for Koa. Uses cookie-based client sessions with AES256-GCM encrypted cookies.

Using client sessions provides a scalable way to store state information in the client. This eliminates the need of a database on server-side and enables to run stateless server instances.

To avoid tampering (data readout and manipulation of the client-visible cookie), session data is encrypted.

However, as a cost, sessions can not be invalidated other than by the user, scenarios such as "log out all sessions of user" are not possible.

## Installation

```js
npm install koa-encrypted-session
```

## Usage

This library inherits from `koa-session`, so all of its options can be used. An additional mandatory `secret` options is introduced, which must be 256 Bits (32 characters) long.

By default, cookie signing is turned off, as AES256-GCM already takes care of this.

## Example

```js
const Koa = require('koa');
const encryptedSession = require('koa-encrypted-session');

const app = new Koa();

app.use(encryptedSession({
    key: 'session',
    maxAge: 7 * 24 * 3600 * 1000,
    secret: 'insert 32 random characters here'
    /** Additional options from koa-session can be used */
}, app));
```

## License

MIT
