const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('server, browser script, and service worker parse cleanly', () => {
  for (const file of ['server.js', 'site/kartik.js', 'site/sw.js']) {
    const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}: ${result.stderr || result.stdout}`);
  }
});

test('journey date is consistently 26 Oct–24 Nov 2026', () => {
  const server = read('server.js');
  const browser = read('site/kartik.js');
  const readme = read('README.md');
  const setup = read('SETUP-REMINDERS.md');
  assert.match(server, /Date\.UTC\(2026, 9, 26\)/);
  assert.match(browser, /new Date\(2026,9,26\)/);
  assert.match(browser, /26 Oct – 24 Nov 2026/);
  assert.match(readme, /26 October–24 November 2026/);
  assert.match(setup, /26 October through 24 November 2026/);
  assert.doesNotMatch([server, browser, readme, setup].join('\n'), /26 Nov|26 November|27 Oct|27 October/);
});

test('HTML loads split frontend assets and share preview image', () => {
  const html = read('site/kartik.html');
  assert.match(html, /href="\/kartik\.css\?v=20261022-sky2"/);
  assert.match(html, /src="\/kartik\.js\?v=20261022-sky2"/);
  assert.match(html, /og:image:alt/);
  assert.match(html, /twitter:image:alt/);
  assert.match(html, /id="alertHelp"/);
  const imagePath = path.join(root, 'site/kartik-share-26-oct-2026.png');
  assert.ok(fs.existsSync(imagePath), 'social preview image exists');
  const image = fs.readFileSync(imagePath);
  assert.equal(image.subarray(1, 4).toString('ascii'), 'PNG');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test('reminder time saves even while reminders are off', () => {
  const browser = read('site/kartik.js');
  assert.match(browser, /await saveAlertSettings\(alertState\.enabled\)/);
  assert.match(browser, /alertHelp/);
  assert.match(browser, /prefers-reduced-motion/);
});

test('service worker displays push notifications and handles taps', () => {
  const sw = read('site/sw.js');
  assert.match(sw, /self\.addEventListener\('push'/);
  assert.match(sw, /showNotification\(title/);
  assert.match(sw, /self\.addEventListener\('notificationclick'/);
  assert.match(sw, /self\.clients\.openWindow\(target\)/);
});

test('sign-in lasts the whole journey and cron secret stays out of URLs and logs', () => {
  const server = read('server.js');
  assert.match(server, /LOGIN_DAYS = 35/);
  assert.match(server, /expiresIn: `\$\{LOGIN_DAYS\}d`/);
  assert.match(server, /maxAge: LOGIN_DAYS \* 86400000/);
  assert.doesNotMatch(server, /req\.query\.key/);
  assert.match(server, /split\('\?'\)\[0\]/);
});
