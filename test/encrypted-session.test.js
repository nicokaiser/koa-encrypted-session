'use strict';

const Koa = require('koa');
const request = require('supertest');
const encryptedSession = require('..');

describe('Koa encrypted session', () => {
  describe('when opts not set', () => {
    it('should throw', () => {
      const app = new Koa();
      (function() {
        app.use(encryptedSession());
      }.should.throw('opts required: `encryptedSession(opts, app)`'));
    });
  });

  describe('when app not set', () => {
    it('should throw', () => {
      const app = new Koa();
      (function() {
        app.use(encryptedSession({}));
      }.should.throw('app instance required: `encryptedSession(opts, app)`'));
    });
  });

  describe('when app.secret is not set', () => {
    it('should throw', () => {
      const app = new Koa();
      (function() {
        app.use(encryptedSession({}, app));
      }.should.throw('Invalid key length: opts.secret must be at least 32 bytes'));
    });
  });

  describe('when opts.secret is set', () => {
    it('should work', done => {
      const app = new Koa();

      app.use(encryptedSession({ secret: 'insert 32 random characters here' }, app));

      app.use(async ctx => {
        ctx.session.message = 'hi';
        ctx.body = ctx.session;
      });

      request(app.listen())
        .get('/')
        .expect(200, done);
    });
  });

  describe('when the session contains a ;', () => {
    it('should still work', done => {
      const app = App();

      app.use(async ctx => {
        if (ctx.method === 'POST') {
          ctx.session.string = ';';
          ctx.status = 204;
        } else {
          ctx.body = ctx.session.string;
        }
      });

      const server = app.listen();

      request(server)
        .post('/')
        .expect(204, (err, res) => {
          if (err) return done(err);
          const cookie = res.headers['set-cookie'];
          request(server)
            .get('/')
            .set('Cookie', cookie.join(';'))
            .expect(';', done);
        });
    });
  });
});

function App(options) {
  const app = new Koa();
  options = options || {};
  options.secret = options.secret || 'insert 32 random characters here';
  app.use(encryptedSession(options, app));
  return app;
}
