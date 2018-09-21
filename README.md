# koa-encrypted-session

Encrypted session middleware for Koa. Uses cookie-based client sessions with AES256-GCM encrypted cookies.

Using client sessions provides a scalable way to store state information in the client. This eliminates the need of a database on server-side and enables to run stateless server instances.

To avoid tampering (data readout and manipulation of the client-visible cookie), session data is encrypted.

However, as a cost, sessions can not be invalidated other than by the user. If this is needed, you might want to store expiration information in the session, such as use JSON Web Token or other mechanisms.

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
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    /** Additional options from koa-session can be used */
}, app));
```

## License

MIT
