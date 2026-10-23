const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
let app = null;
let dependencyError = null;
try { app = require('../server'); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; dependencyError = error; }

test('public health/config and logout work without a database connection', { skip: app ? false : `Server dependencies unavailable in this environment (${dependencyError && dependencyError.code || 'load error'}); this test runs after npm install.` }, async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${base}/api/health`, { headers: { connection: 'close' } });
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json().then(({ status, service }) => ({ status, service })), { status: 'ok', service: 'kartik' });

    const config = await fetch(`${base}/api/config`, { headers: { connection: 'close' } });
    assert.equal(config.status, 200);
    assert.equal(typeof (await config.json()).googleClientId, 'string');

    const pushConfig = await fetch(`${base}/api/push/config`, { headers: { connection: 'close' } });
    assert.equal(pushConfig.status, 200);
    const pushBody = await pushConfig.json();
    assert.equal(typeof pushBody.enabled, 'boolean');
    assert.equal(typeof pushBody.publicKey, 'string');

    const logout = await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { connection: 'close' } });
    assert.equal(logout.status, 200);
    assert.deepEqual(await logout.json(), { ok: true });
    assert.match(logout.headers.get('set-cookie') || '', /token=/);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
});
