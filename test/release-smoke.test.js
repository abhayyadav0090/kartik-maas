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

test('journey date is consistently 26 Oct–24 Nov 2026 in India time', () => {
  const server = read('server.js');
  const browser = read('site/kartik.js');
  const readme = read('README.md');
  const setup = read('SETUP-REMINDERS.md');
  assert.match(server, /Date\.UTC\(2026, 9, 26\)/);
  assert.match(browser, /Date\.UTC\(2026,9,26\)/);
  assert.match(browser, /26 Oct – 24 Nov 2026/);
  assert.match(browser, /timeZone:'Asia\/Kolkata'/);
  assert.match(browser, /if\(sel===29\)title\+=' · '\+tr\('purnima'\)/, 'Kartik Purnima is shown on Day 30, 24 November');
  assert.match(browser, /<button type="button" class="d /, 'dynamically-rendered day buttons are not submit buttons');
  assert.doesNotMatch(browser, /if\(sel===28\)title\+=' · '\+tr\('purnima'\)/, 'do not label 23 November as Kartik Purnima');
  assert.match(readme, /Day 1: 26 October 2026\. Day 30: 24 November 2026/);
  assert.match(setup, /26 October through 24 November 2026/);
  assert.doesNotMatch([server, browser, readme, setup].join('\n'), /26 Nov|26 November|27 Oct|27 October/);
});

test('every literal ID selector used by browser code exists exactly once in HTML', () => {
  const html = read('site/kartik.html');
  const browser = read('site/kartik.js');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'HTML id attributes must be unique');
  const refs = [...browser.matchAll(/\$\(['"]#([A-Za-z][A-Za-z0-9_-]*)['"]\)/g)].map((match) => match[1]);
  for (const id of new Set(refs)) assert.ok(ids.includes(id), `browser selector #${id} exists in HTML`);
});

test('HTML uses separated, versioned frontend files and current social preview', () => {
  const html = read('site/kartik.html');
  assert.match(html, /href="\/kartik\.css\?v=20261023-modern2"/);
  assert.match(html, /src="\/kartik\.js\?v=20261023-modern2"/);
  assert.match(html, /id="themeBtn"/);
  assert.match(html, /id="toast"[^>]+aria-live="polite"/);
  assert.match(html, /<textarea id="note"/);
  assert.match(html, /og:image:alt/);
  assert.match(html, /twitter:image:alt/);
  assert.match(html, /id="alertHelp"/);
  assert.match(html, /aria-describedby="addrNote"/);
  assert.match(read('site/kartik.js'), /sc\.onerror=\(\)=>\{\$\('#err'\)\.textContent=tr\('googleLoadFail'\)\}/);
  assert.match(read('site/kartik.js'), /document\.querySelector\('main'\)\.inert=true/);
  assert.match(read('site/kartik.js'), /meta\.content=preferredTheme==='dark'\?'#171319':'#f7f4ee'/);
  assert.doesNotMatch(html, /<button(?![^>]*\btype=)[^>]*>/i, 'all static buttons have explicit type attributes');
  for (const asset of ['site/kartik.css', 'site/kartik.js', 'site/sw.js', 'site/kartik-manifest.json']) {
    assert.ok(fs.existsSync(path.join(root, asset)), `${asset} exists`);
  }
  const image = fs.readFileSync(path.join(root, 'site/kartik-share-26-oct-2026.png'));
  assert.equal(image.subarray(1, 4).toString('ascii'), 'PNG');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  const css = read('site/kartik.css');
  const localCssAssets = [...css.matchAll(/url\([\"']?(\/[^\"')]+)[\"']?\)/g)].map((match) => match[1]);
  for (const asset of localCssAssets) assert.ok(fs.existsSync(path.join(root, 'site', asset.slice(1))), `CSS asset ${asset} exists`);
});

test('accessible responsive styling and reduced-motion preference are present', () => {
  const css = read('site/kartik.css');
  const js = read('site/kartik.js');
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /body\[data-theme="dark"\]/);
  assert.doesNotMatch(js, /setInterval\(tick,\s*1000\)/);
  assert.match(js, /function showToast/);
  assert.match(js, /ArrowRight/);
});

test('reminder time persists while reminders are off and status is explained', () => {
  const browser = read('site/kartik.js');
  const html = read('site/kartik.html');
  assert.match(browser, /await saveAlertSettings\(alertState\.enabled\)/);
  assert.match(browser, /alertTimeSaved/);
  assert.match(html, /id="alertHelp"/);
  assert.match(browser, /Sound and vibration depend on your phone\/browser settings/);
});

test('saved language is applied on the sign-in screen before authentication', () => {
  const browser = read('site/kartik.js');
  assert.match(browser, /applyLanguage\(\);\s*boot\(\);\s*$/);
});

test('backup migration clamps japa values and default-vow restoration is ID-safe', () => {
  const browser = read('site/kartik.js');
  assert.match(browser, /D\.goal=Math\.max\(1,Math\.min\(64,Math\.floor\(Number\(D\.goal\)\|\|16\)\)\)/);
  assert.match(browser, /v\.rounds=Math\.max\(0,Math\.min\(64,Math\.floor\(Number\(v\.rounds\)\|\|0\)\)\)/);
  assert.match(browser, /const haveIds=new Set\(D\.vows\.map\(v=>v\.id\)\)/);
  assert.match(browser, /if\(D\.vows\.length>=60\)\{skipped\+\+;return\}/);
  assert.match(browser, /t\.slice\(0,120\)/);
});

test('service worker displays push notifications and handles taps', () => {
  const sw = read('site/sw.js');
  assert.match(sw, /self\.addEventListener\('push'/);
  assert.match(sw, /showNotification\(title/);
  assert.match(sw, /self\.addEventListener\('notificationclick'/);
  assert.match(sw, /self\.clients\.openWindow\(target\)/);
});

test('sign-in session, secret hygiene and bounded reminder processing', () => {
  const server = read('server.js');
  assert.match(server, /LOGIN_DAYS = 35/);
  assert.match(server, /expiresIn: `\$\{LOGIN_DAYS\}d`/);
  assert.match(server, /maxAge: LOGIN_DAYS \* 86400000/);
  assert.doesNotMatch(server, /req\.query\.key/);
  assert.match(server, /split\('\?'\)\[0\]/);
  assert.match(server, /await forEachLimit\(alerts, 8/);
  assert.match(server, /noDevices/);
  assert.match(server, /app\.use\(\['\/api\/auth\/google', '\/api\/me', '\/api\/kartik', '\/api\/push\/subscribe'\]/);
});

test('environment template lists required variable names without actual secrets', () => {
  const env = read('.env.example');
  for (const key of ['NODE_ENV', 'MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT']) {
    assert.match(env, new RegExp(`^${key}=`, 'm'), `${key} listed`);
  }
  assert.match(env, /replace-with-a-long-random-secret/);
  assert.match(env, /your-google-oauth-web-client-id/);
  assert.ok(fs.existsSync(path.join(root, '.gitignore')));
});
