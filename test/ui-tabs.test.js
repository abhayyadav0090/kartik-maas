// Browser-level checks (navigation, dates, vow reminders) using jsdom with a fake API.
// Skipped automatically when the dev dependency `jsdom` is not installed (run `npm install` first).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let JSDOM = null; let skipReason = false;
try { ({ JSDOM } = require('jsdom')); } catch (_) { skipReason = 'jsdom is not installed (dev dependency) — run npm install'; }

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'site/kartik.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'site/kartik.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const IST = (y, mo, d, h = 12, mi = 0) => Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000; // an instant expressed in India time

// Boots the real page with an in-memory fake of the server API and a fixed clock.
async function boot({ now, state = null, revision = 0, permission = 'default' }) {
  const calls = { puts: [], alertPuts: [], subscribes: 0, unsubscribes: 0 };
  const server = { state, revision, alert: { configured: true, enabled: false, hour: 18, minute: 0, tz: 'Asia/Kolkata', devices: 0 } };
  const dom = new JSDOM(html.replace(/<script src="\/kartik\.js[^"]*"><\/script>/, ''), {
    url: 'https://kartik.test/kartik', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      const RealDate = w.Date;
      w.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(now); } static now() { return now; } };
      w.scrollTo = () => {}; w.alert = () => {}; w.confirm = () => true; w.prompt = () => null;
      class N { static requestPermission() { N.permission = 'granted'; return Promise.resolve('granted'); } }
      N.permission = permission; w.Notification = N; w.PushManager = function () {};
      let sub = null;
      const reg = { pushManager: {
        getSubscription: async () => sub,
        subscribe: async o => (sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', options: { applicationServerKey: o.applicationServerKey.buffer }, toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'p', auth: 'a' } }; }, async unsubscribe() { sub = null; calls.unsubscribes++; return true; } }),
      } };
      Object.defineProperty(w.navigator, 'serviceWorker', { value: { register: async () => reg, ready: Promise.resolve(reg), getRegistration: async () => reg }, configurable: true });
      const json = (code, body) => Promise.resolve({ ok: code >= 200 && code < 300, status: code, json: async () => body });
      w.fetch = (url, o = {}) => {
        const m = (o.method || 'GET').toUpperCase(); const body = o.body ? JSON.parse(o.body) : {};
        if (url === '/api/me') return json(200, { name: 'Abhay Yadav', email: 'a@x.test' });
        if (url === '/api/kartik' && m === 'GET') return json(200, { state: server.state, revision: server.revision });
        if (url === '/api/kartik' && m === 'PUT') { calls.puts.push(body); server.state = body.state; server.revision += 1; return json(200, { ok: true, revision: server.revision }); }
        if (url === '/api/kartik/alerts' && m === 'GET') return json(200, server.alert);
        if (url === '/api/kartik/alerts' && m === 'PUT') { calls.alertPuts.push(body); Object.assign(server.alert, body); return json(200, server.alert); }
        if (url === '/api/kartik/alerts/test') return json(200, { ok: true });
        if (url === '/api/push/config') return json(200, { enabled: true, publicKey: 'AQAB' });
        if (url === '/api/push/subscribe' && m === 'POST') { calls.subscribes++; return json(200, { ok: true }); }
        if (url === '/api/push/subscribe' && m === 'DELETE') return json(200, { ok: true });
        return json(404, {});
      };
    },
  });
  const tag = dom.window.document.createElement('script'); tag.textContent = script; dom.window.document.body.appendChild(tag); // real <script>: top-level let/const stay global, as in the browser
  await sleep(60);
  const w = dom.window; const $ = s => w.document.querySelector(s); const $$ = s => [...w.document.querySelectorAll(s)];
  const visible = id => !$('#' + id).classList.contains('hide');
  const fire = (el, type = 'change') => el.dispatchEvent(new w.Event(type, { bubbles: true }));
  return { dom, w, $, $$, visible, fire, calls, server, ev: code => w.eval(code), close: () => dom.window.close() };
}

const oldState = () => ({ vows: [{ id: 'v0', t: 'Wake up during Brahma Muhurta', on: true, core: true }, { id: 'v1', t: 'Read Srila Prabhupada’s books', on: true, core: false }, { id: 'c99', t: 'My own vow', on: true, core: false }], goal: 16, log: {}, lang: 'en' });

test('four tabs: each opens only its own content', { skip: skipReason }, async () => {
  const p = await boot({ now: IST(2026, 10, 27), state: oldState(), revision: 1 });
  try {
    assert.deepEqual(p.$$('.tabs [data-t]').map(b => b.textContent), ['🏠 Home', '🪔 Daily', '⭐ My Vows', '📊 Analysis']);
    assert.ok(p.visible('home') && !p.visible('today') && !p.visible('vows') && !p.visible('stats'), 'opens on Home');
    const homeOrder = [...p.$('#home').children].map(e => e.id || e.className.split(' ')[1] || e.className);
    assert.ok(p.$('#home').contains(p.$('#shl')) && p.$('#home').contains(p.$('#hello')) && p.$('#home').contains(p.$('#heroTagline')) && p.$('#home').contains(p.$('#alertCard')), homeOrder.join());
    const kids = [...p.$('#home').children].map(e => e.id || (e.querySelector('#hello') ? 'greeting' : '?'));
    assert.deepEqual(kids, ['shl', 'greeting', 'sloganSlot', 'footerMantra', 'alertCard'], 'Home order: shloka, greeting, blessing, slogan, reminder');
    assert.ok(p.visible('hero'), 'title/date block shows on Home');
    for (const [tab, section] of [['today', 'today'], ['vows', 'vows'], ['stats', 'stats']]) {
      p.$(`.tabs [data-t="${tab}"]`).click();
      for (const s of ['home', 'today', 'vows', 'stats']) assert.equal(p.visible(s), s === section, `${tab}: ${s}`);
      assert.ok(!p.visible('hero'), `${tab}: no Home hero`);
      assert.equal(p.$('.tabs .on').dataset.t, tab);
      assert.ok(!p.$('#' + section).contains(p.$('#hello')) && !p.$('#' + section).contains(p.$('#alertCard')) && !p.$('#' + section).contains(p.$('#heroTagline')));
    }
    assert.match(p.w.location.hash, /^#analysis$/);
    p.$('.tabs [data-t="home"]').click();
    assert.ok(p.visible('home') && p.visible('hero') && p.w.location.hash === '#home');
    assert.equal(p.$$('#alertCard, #hello, #heroTagline').length, 3, 'nothing duplicated');
  } finally { p.close(); }
});

test('deep link #vows opens My Vows directly; #analysis opens Analysis', { skip: skipReason }, async () => {
  for (const [hash, section] of [['#vows', 'vows'], ['#analysis', 'stats'], ['#daily', 'today']]) {
    const dom0 = await boot({ now: IST(2026, 10, 27), state: oldState(), revision: 1 });
    dom0.w.location.hash = hash; await sleep(30);
    assert.ok(dom0.visible(section), hash);
    dom0.close();
  }
});

test('journey dates: Day 1 = 26 Oct 2026 … Day 30 = 24 Nov 2026 (India calendar boundaries)', { skip: skipReason }, async () => {
  const cases = [[IST(2026, 10, 25, 23, 59), -1], [IST(2026, 10, 26, 0, 0), 0], [IST(2026, 10, 26, 23, 59), 0], [IST(2026, 10, 27, 0, 0), 1], [IST(2026, 11, 24, 23, 59), 29], [IST(2026, 11, 25, 0, 0), 30]];
  for (const [now, expected] of cases) {
    const p = await boot({ now, state: oldState(), revision: 1 });
    try { assert.equal(p.ev('todayIdx()'), expected, new Date(now).toISOString()); } finally { p.close(); }
  }
  const p = await boot({ now: IST(2026, 10, 26, 8), state: oldState(), revision: 1 });
  try {
    p.$('.tabs [data-t="today"]').click();
    assert.match(p.$('#dayT').textContent, /^Day 1 · 26 Oct$/);
    assert.equal(p.$$('#days .d').length, 30);
    assert.equal(p.$$('#days .d')[29].getAttribute('aria-label').startsWith('Day 30, 24 Nov'), true);
    assert.equal(p.$$('#days .d').filter(b => !b.disabled).length, 1, 'only Day 1 is open on 26 Oct');
    assert.ok(!p.$('#clearTest'), 'clear-test button is gone');
    assert.ok(!/testing/i.test(p.$('#lockHint').textContent), p.$('#lockHint').textContent);
  } finally { p.close(); }
});

test('before Kartik begins: no testing mode, Day 1 locked, pre-journey Day 1 test entries removed with a local backup', { skip: skipReason }, async () => {
  const st = oldState(); st.log = { 0: { done: ['v0'], rounds: 3, note: 'test' } };
  const p = await boot({ now: IST(2026, 10, 25, 12), state: st, revision: 4 });
  try {
    p.$('.tabs [data-t="today"]').click();
    assert.equal(p.$$('#days .d').filter(b => !b.disabled).length, 0);
    assert.match(p.$('#lockHint').textContent, /begins on 26 Oct 2026/);
    assert.ok(!/test/i.test(p.$('#lockHint').textContent) && !p.$('#clearTest'));
    await sleep(900);
    assert.ok(!p.calls.puts.at(-1).state.log['0'], 'stale Day 1 test entry removed from saved state');
    assert.ok(p.w.localStorage.getItem('kv_day1_prestart_backup_a@x.test'), 'device backup kept');
    assert.equal(p.calls.puts.at(-1).state.vows.length, 3, 'vows untouched');
  } finally { p.close(); }
});

test('real progress on Day 1 (26 Oct) is kept and editable', { skip: skipReason }, async () => {
  const st = oldState(); st.log = { 0: { done: ['v0'], rounds: 2, note: '' } };
  const p = await boot({ now: IST(2026, 10, 26, 9), state: st, revision: 2 });
  try {
    p.$('.tabs [data-t="today"]').click();
    const box = p.$('#list input[data-id="v1"]'); assert.equal(box.disabled, false);
    box.checked = true; p.fire(box); await sleep(900);
    assert.deepEqual(p.calls.puts.at(-1).state.log['0'].done.sort(), ['v0', 'v1']);
    assert.equal(p.calls.puts.at(-1).state.log['0'].rounds, 2);
  } finally { p.close(); }
});

test('existing vows get default reminders (OFF); custom vows get a default time', { skip: skipReason }, async () => {
  const p = await boot({ now: IST(2026, 10, 27), state: oldState(), revision: 1 });
  try {
    p.$('.tabs [data-t="vows"]').click();
    assert.equal(p.$$('#vlist .vow-rem').length, 3);
    const D = JSON.parse(JSON.stringify(p.ev('D')));
    const byId = Object.fromEntries(D.vows.map(v => [v.id, v.reminder]));
    assert.deepEqual(byId.v0, { enabled: false, hour: 4, minute: 30 });
    assert.deepEqual(byId.v1, { enabled: false, hour: 20, minute: 0 });
    assert.deepEqual(byId.c99, { enabled: false, hour: 19, minute: 0 });
    p.$('#nv').value = 'No sleeping after sunrise'; p.$('#addV').click();
    const added = JSON.parse(JSON.stringify(p.ev('D'))).vows.find(v => v.t === 'No sleeping after sunrise');
    assert.deepEqual(added.reminder, { enabled: false, hour: 19, minute: 0 });
    assert.equal(added.t, 'No sleeping after sunrise', 'custom name kept exactly (no translation)');
    assert.equal(p.$$('#vlist .vow').length, 4);
  } finally { p.close(); }
});

test('fresh account has all 12 vows, each with its own reminder config', { skip: skipReason }, async () => {
  const p = await boot({ now: IST(2026, 10, 27), state: null, revision: 0 });
  try {
    const D = JSON.parse(JSON.stringify(p.ev('D')));
    assert.equal(D.vows.length, 12);
    assert.ok(D.vows.every(v => v.reminder && v.reminder.enabled === false && Number.isInteger(v.reminder.hour)));
    assert.equal(new Set(D.vows.map(v => v.id)).size, 12);
  } finally { p.close(); }
});

test('editing / enabling one vow reminder never touches another, and is saved with the time zone', { skip: skipReason }, async () => {
  const p = await boot({ now: IST(2026, 10, 27), state: oldState(), revision: 1 });
  try {
    p.$('.tabs [data-t="vows"]').click();
    const idx = id => p.ev('D').vows.findIndex(v => v.id === id);
    const time = p.$(`[data-rt="${idx('v1')}"]`); time.value = '21:15'; p.fire(time);
    await sleep(900);
    let saved = p.calls.puts.at(-1).state;
    assert.deepEqual(saved.vows.find(v => v.id === 'v1').reminder, { enabled: false, hour: 21, minute: 15 });
    assert.deepEqual(saved.vows.find(v => v.id === 'v0').reminder, { enabled: false, hour: 4, minute: 30 });
    const sw = p.$(`[data-rv="${idx('v1')}"]`); sw.checked = true; p.fire(sw);
    await sleep(1000);
    assert.equal(p.calls.subscribes, 1, 'device subscribed for push');
    saved = p.calls.puts.at(-1); assert.equal(typeof saved.tz, 'string');
    assert.deepEqual(saved.state.vows.find(v => v.id === 'v1').reminder, { enabled: true, hour: 21, minute: 15 });
    assert.equal(saved.state.vows.filter(v => v.reminder.enabled).length, 1, 'only that vow is on');
    assert.match(p.$('#vowRemStatus').textContent, /9:15\s?pm/i);
    // turn it off again: global reminder untouched, device released because nothing else needs it
    const sw2 = p.$(`[data-rv="${idx('v1')}"]`); sw2.checked = false; p.fire(sw2); await sleep(900);
    assert.equal(p.calls.puts.at(-1).state.vows.filter(v => v.reminder.enabled).length, 0);
    assert.equal(p.calls.unsubscribes, 1);
  } finally { p.close(); }
});

test('global reminder keeps working next to vow reminders; turning it off keeps the device for vow reminders', { skip: skipReason }, async () => {
  const p = await boot({ now: IST(2026, 10, 27), state: oldState(), revision: 1 });
  try {
    p.$('.tabs [data-t="vows"]').click();
    const i = p.ev('D').vows.findIndex(v => v.id === 'v0');
    const sw = p.$(`[data-rv="${i}"]`); sw.checked = true; p.fire(sw); await sleep(900);
    p.$('.tabs [data-t="home"]').click();
    const g = p.$('#alertToggle'); g.checked = true; p.fire(g); await sleep(300);
    assert.equal(p.calls.alertPuts.at(-1).enabled, true);
    g.checked = false; p.fire(g); await sleep(300);
    assert.equal(p.calls.alertPuts.at(-1).enabled, false);
    assert.equal(p.calls.unsubscribes, 0, 'device kept: a vow reminder still needs it');
    assert.equal(p.ev('D').vows.find(v => v.id === 'v0').reminder.enabled, true);
  } finally { p.close(); }
});

test('Hindi: tab labels and vow reminder text translate; custom vow names stay as typed', { skip: skipReason }, async () => {
  const st = oldState(); st.lang = 'hi';
  const p = await boot({ now: IST(2026, 10, 27), state: st, revision: 1 });
  try {
    assert.deepEqual(p.$$('.tabs [data-t]').map(b => b.textContent), ['🏠 होम', '🪔 दैनिक', '⭐ मेरे व्रत', '📊 विश्लेषण']);
    p.$('.tabs [data-t="vows"]').click();
    assert.match(p.$('#vowRemHelp').textContent, /रिमाइंडर/);
    assert.ok([...p.$$('#vlist [data-ed]')].some(i => i.value === 'My own vow'));
  } finally { p.close(); }
});
