import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

test('compiled backend starts and verifies signing keys without require(ESM) support', () => {
  execFileSync(process.execPath, ['--no-experimental-require-module', '-e', `
    const assert = require('node:assert/strict');
    const crypto = require('node:crypto');
    const app = require('./dist/index.js');
    const { retrieveSigningKeys } = require('jwks-rsa/src/utils');
    (async () => {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
      const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'runtime-test', alg: 'RS256', use: 'sig' };
      const keys = await retrieveSigningKeys([jwk]);
      assert.equal(keys.length, 1);
      const data = Buffer.from('signed test payload');
      const signature = crypto.sign('sha256', data, privateKey);
      assert.ok(crypto.verify('sha256', data, keys[0].getPublicKey(), signature));
      assert.equal(crypto.verify('sha256', Buffer.from('tampered'), keys[0].getPublicKey(), signature), false);
      assert.equal(typeof app, 'function');
      const server = app.listen(0, '127.0.0.1');
      await new Promise(resolve => server.once('listening', resolve));
      try {
        const base = 'http://127.0.0.1:' + server.address().port;
        assert.equal((await fetch(base + '/health')).status, 200);
        const response = await fetch(base + '/api/analytics/pageview', {
          method: 'OPTIONS', headers: {
            Origin: 'https://lawersfoundation-ten.vercel.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
          },
        });
        assert.equal(response.status, 204);
        assert.equal(response.headers.get('access-control-allow-origin'), 'https://lawersfoundation-ten.vercel.app');
      } finally { await new Promise(resolve => server.close(resolve)); }
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `], {
    cwd: path.resolve(__dirname, '..'),
    timeout: 30000,
    env: { ...process.env, FIREBASE_PROJECT_ID: '', FIREBASE_CLIENT_EMAIL: '', FIREBASE_PRIVATE_KEY: '', FRONTEND_URL: 'https://lawersfoundation-ten.vercel.app' },
    stdio: 'pipe',
  });
});
