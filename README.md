# koa-encrypted-session

![CI](https://github.com/nicokaiser/koa-encrypted-session/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/koa-encrypted-session.svg?style=flat)](https://www.npmjs.com/package/koa-encrypted-session)

Encrypted session middleware for Koa. Uses cookie-based client sessions with libsodium's [Secret key box](https://github.com/sodium-friends/sodium-native#secret-key-box-encryption) encrypted cookies.

Using client sessions provides a scalable way to store state information in the client. This eliminates the need of a database on server-side and enables to run stateless server instances.

To avoid tampering (data readout and manipulation of the client-visible cookie), session data is encrypted.

However, as a cost, sessions can not be invalidated other than by the user, scenarios such as "log out all sessions of user" are not possible.

## Installation

```js
npm install koa-encrypted-session
```

## Usage

This library inherits from `koa-session`, so all of its options can be used. An additional `secretKey` option is introduced, which must be a high-entropy key. This key can be generated with:

```
./node_modules/.bin/koa-encrypted-session-gen-key
```

Alternatively, a `secret` passphrase and (optional) a `salt` can be used, which is at startup hashed.

## Example

```js
const Koa = require('koa');
const encryptedSession = require('koa-encrypted-session');

const app = new Koa();

app.use(encryptedSession({
    key: 'session',
    maxAge: 7 * 24 * 3600 * 1000,
    secretKey: Buffer.from('EsAg64LMvGITBBz1ZGLfDNU/MYqGDpTzJ1u4BsvIfTw=', 'base64')
    /** Additional options from koa-session can be used */
}, app));
```

## Acknowledgements

The encryption parts of this code are ported to Koa from [`fastify-secret-session`](https://github.com/mcollina/fastify-secure-session).

## License

MIT
