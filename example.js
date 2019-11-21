const Koa = require('koa');
const encryptedSession = require('./');

const app = new Koa();

app.use(
  encryptedSession(
    {
      key: 'session',
      maxAge: 7 * 24 * 3600 * 1000,
      secretKey: Buffer.from('EsAg64LMvGITBBz1ZGLfDNU/MYqGDpTzJ1u4BsvIfTw=', 'base64')
      /** Additional options from koa-session can be used */
    },
    app
  )
);

app.use(ctx => {
  // ignore favicon
  if (ctx.path === '/favicon.ico') return;

  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
  ctx.body = n + ' views';
});

app.listen(3000);
