// Individual vow reminders: scheduling rules, validation, de-duplication and global/individual coexistence.
// Pure-logic tests always run. The MongoDB suite runs only when KARTIK_TEST_MONGO_URI points at a throw-away
// MongoDB, e.g. KARTIK_TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm test  (a temporary database is created and dropped).
const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const TEST_URI = process.env.KARTIK_TEST_MONGO_URI || '';
let app = null; let skip = false;
try {
  const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys();
  Object.assign(process.env, { VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey, VAPID_SUBJECT: 'mailto:test@example.com', JWT_SECRET: 'test-secret', GOOGLE_CLIENT_ID: 'test-client' });
  delete process.env.MONGO_URI;
  if (TEST_URI) process.env.MONGO_URI = `${TEST_URI.replace(/\/+$/, '')}/kartik_test_${process.pid}_${Date.now()}`;
  app = require('../server');
} catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; skip = `Server dependencies unavailable (${error.code}); run npm install.`; }

const I = app && app.internals;
const IST = (y, mo, d, h = 12, mi = 0) => new Date(Date.UTC(y, mo - 1, d, h, mi) - 330 * 60000);
const vow = (id, hour, minute, extra = {}) => ({ id, t: `Vow ${id}`, on: true, core: false, reminder: { enabled: true, hour, minute }, ...extra });

test('Kartik dates: Day 1 = 26 Oct 2026, Day 30 = 24 Nov 2026 (India calendar)', { skip }, () => {
  assert.equal(I.JOURNEY_DAYS, 30);
  assert.equal(I.dayIndexIndia(IST(2026, 10, 25, 23, 59)), -1);
  assert.equal(I.dayIndexIndia(IST(2026, 10, 26, 0, 0)), 0);
  assert.equal(I.dayIndexIndia(IST(2026, 10, 26, 23, 59)), 0);
  assert.equal(I.dayIndexIndia(IST(2026, 10, 27, 0, 0)), 1);
  assert.equal(I.dayIndexIndia(IST(2026, 11, 24, 23, 59)), 29);
  assert.equal(I.dayIndexIndia(IST(2026, 11, 25, 0, 0)), 30);
  // UTC instants around the same boundaries (18:29 UTC on 25 Oct is still 25 Oct in India)
  assert.equal(I.dayIndexIndia(new Date(Date.UTC(2026, 9, 25, 18, 29))), -1);
  assert.equal(I.dayIndexIndia(new Date(Date.UTC(2026, 9, 25, 18, 30))), 0);
});

test('no log entry is editable before Day 1; afterwards only today and earlier days', { skip }, () => {
  const withDay = i => ({ vows: [], log: { [i]: { done: ['v0'], rounds: 0, note: '' } } });
  assert.equal(I.changedFutureDay(withDay(0), null, IST(2026, 10, 25)), 0, 'Day 1 is locked before 26 Oct (testing mode removed)');
  assert.equal(I.changedFutureDay(withDay(0), null, IST(2026, 10, 26, 0, 5)), -1, 'Day 1 is editable on 26 Oct');
  assert.equal(I.changedFutureDay(withDay(1), null, IST(2026, 10, 26, 10)), 1, 'Day 2 is locked on 26 Oct');
  assert.equal(I.changedFutureDay(withDay(29), null, IST(2026, 11, 24, 10)), -1, 'Day 30 editable on 24 Nov');
  const same = withDay(0); assert.equal(I.changedFutureDay(same, same, IST(2026, 10, 25)), -1, 'unchanged stored entries are not rejected');
});

test('vow reminder validation: valid shape kept, bad values rejected, old vows without reminder accepted', { skip }, () => {
  const ok = [{ id: 'v0', t: 'a' }, { id: 'c123', t: 'b', reminder: { enabled: true, hour: 5, minute: 0, junk: 1 } }];
  assert.equal(I.sanitizeVowReminders(ok), null);
  assert.deepEqual(ok[1].reminder, { enabled: true, hour: 5, minute: 0 });
  for (const bad of [{ enabled: 'yes', hour: 1, minute: 1 }, { enabled: true, hour: 24, minute: 0 }, { enabled: true, hour: 1, minute: 60 }, { enabled: true, hour: 1.5, minute: 0 }, { enabled: true, hour: -1, minute: 0 }, null, 'x'])
    assert.ok(I.sanitizeVowReminders([{ id: 'v1', t: 'x', reminder: bad }]), JSON.stringify(bad));
  assert.ok(I.sanitizeVowReminders([{ id: 'a.b$', t: 'x', reminder: { enabled: true, hour: 1, minute: 1 } }]), 'ids that are unsafe as Mongo field names are rejected');
});

test('due reminders: time window, active, completed, disabled, already sent', { skip }, () => {
  const state = { vows: [vow('a', 5, 0), vow('off', 5, 0, { reminder: { enabled: false, hour: 5, minute: 0 } }), vow('inactive', 5, 0, { on: false }), vow('done', 5, 0), vow('later', 18, 0), { id: 'old', t: 'no reminder field', on: true }], log: { 1: { done: ['done'] } } };
  const day2 = (h, m) => IST(2026, 10, 27, h, m); // 27 Oct = Day 2 (index 1)
  const ids = (now, sent) => I.dueVowReminders(state, 'Asia/Kolkata', now, sent).due.map(v => v.id);
  assert.deepEqual(ids(day2(4, 59)), [], 'before the time');
  assert.deepEqual(ids(day2(5, 0)), ['a'], 'exactly at the time');
  assert.deepEqual(ids(day2(5, 59)), ['a'], 'inside the 60-minute catch-up window');
  assert.deepEqual(ids(day2(6, 0)), [], 'window closed');
  assert.deepEqual(ids(day2(18, 0)), ['later']);
  assert.deepEqual(ids(day2(5, 10), { a: '2026-10-27' }), [], 'already sent today');
  assert.deepEqual(ids(day2(5, 10), { a: '2026-10-26' }), ['a'], 'sent yesterday does not block today');
  assert.deepEqual(ids(IST(2026, 10, 25, 5, 10)), [], 'before Kartik begins');
  assert.deepEqual(ids(IST(2026, 11, 25, 5, 10)), [], 'after Kartik ends');
  assert.deepEqual(ids(IST(2026, 10, 26, 5, 10)), ['a', 'done'], 'Day 1: nothing completed yet');
  assert.deepEqual(ids(IST(2026, 11, 24, 5, 10)), ['a', 'done'], 'Day 30 still active');
});

test('due reminders follow the user’s own time zone (and the 26 Oct–24 Nov India day numbering)', { skip }, () => {
  const state = { vows: [vow('w', 9, 0)], log: {} };
  const ny = new Date(Date.UTC(2026, 9, 27, 13, 5)); // 09:05 in New York (EDT, UTC-4) on 27 Oct
  assert.deepEqual(I.dueVowReminders(state, 'America/New_York', ny, {}).due.map(v => v.id), ['w']);
  assert.equal(I.dueVowReminders(state, 'America/New_York', ny, {}).key, '2026-10-27');
  assert.deepEqual(I.dueVowReminders(state, 'Asia/Kolkata', ny, {}).due, [], '09:05 New York is 22:35 in India: not due for an India user');
  assert.deepEqual(I.dueVowReminders(state, 'Not/AZone', IST(2026, 10, 27, 9, 5), {}).due.map(v => v.id), ['w'], 'invalid zone falls back to India');
  assert.deepEqual(I.dueVowReminders(state, undefined, IST(2026, 10, 27, 9, 5), {}).due.map(v => v.id), ['w'], 'missing zone means India, never the server’s own zone');
});

test('global reminder never repeats a vow that has its own enabled reminder', { skip }, () => {
  const state = { lang: 'en', vows: [vow('own', 18, 0), { id: 'plain', t: 'Plain vow', on: true, core: false }, vow('offrem', 6, 0, { reminder: { enabled: false, hour: 6, minute: 0 } })], log: {} };
  const p = I.reminderPayload(state, 1);
  assert.match(p.body, /2 of 2 vows/); assert.ok(p.body.includes('Plain vow') && p.body.includes('Vow offrem') && !p.body.includes('Vow own'));
  assert.equal(I.reminderPayload({ vows: [vow('only', 18, 0)], log: {} }, 1), null, 'nothing left for the global reminder to cover');
  assert.equal(I.reminderPayload({ vows: [{ id: 'a', t: 'A', on: true }], log: {} }, 1).url, '/kartik#daily');
});

test('vow reminder notification text (single, grouped, Hindi)', { skip }, () => {
  const st = { lang: 'en', addr: 'prabhu' };
  const one = I.vowReminderPayload(st, [{ id: 'v0', t: 'Wake up during Brahma Muhurta' }], 1);
  assert.match(one.title, /Day 2 vow reminder/); assert.match(one.body, /Wake up during Brahma Muhurta/); assert.equal(one.tag, 'kartik-vow-v0-2'); assert.equal(one.url, '/kartik#daily');
  const many = I.vowReminderPayload(st, ['a', 'b', 'c', 'd'].map(id => ({ id, t: `T${id}` })), 1);
  assert.match(many.body, /4 vows are due now: Ta, Tb, Tc…/); assert.notEqual(many.tag, one.tag);
  assert.match(I.vowReminderPayload({ lang: 'hi' }, [{ id: 'v0', t: 'X' }], 0).title, /दिन 1/);
});

// ------------------------------------------------------------------ MongoDB integration (real database)
const dbSkip = skip || (TEST_URI ? false : 'set KARTIK_TEST_MONGO_URI to run the MongoDB integration tests');
test('MongoDB integration: save validation, scheduling, de-duplication, global + individual', { skip: dbSkip }, async (t) => {
  const mongoose = require('mongoose'); const jwt = require('jsonwebtoken'); const { User, KartikState, KartikAlert, PushSubscription } = I.models;
  await mongoose.connect(process.env.MONGO_URI); await Promise.all([User, KartikState, KartikAlert, PushSubscription].map(m => m.init()));
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const sent = []; let failWith = null; const realSend = I.webpush.sendNotification;
  I.webpush.sendNotification = async (sub, body) => { if (failWith) { const e = new Error('push failed'); e.statusCode = failWith; throw e; } sent.push(JSON.parse(body)); return { statusCode: 201 }; };
  t.after(async () => { I.webpush.sendNotification = realSend; server.closeAllConnections?.(); await new Promise(r => server.close(r)); await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

  const user = await User.create({ googleId: 'g-test', email: 'dev@example.com', name: 'Dev' });
  const cookie = `token=${jwt.sign({ id: user._id }, process.env.JWT_SECRET)}`;
  const call = (method, url, body) => fetch(base + url, { method, headers: { 'content-type': 'application/json', cookie, connection: 'close' }, body: body ? JSON.stringify(body) : undefined });
  await PushSubscription.create({ userId: user._id, endpoint: 'https://fcm.googleapis.com/fcm/send/dev-1', keys: { p256dh: 'p', auth: 'a' }, app: 'kartik' });

  await t.test('PUT /api/kartik rejects an invalid vow reminder and stores a valid one', async () => {
    let r = await call('PUT', '/api/kartik', { revision: 0, state: { vows: [{ id: 'v0', t: 'x', on: true, reminder: { enabled: true, hour: 99, minute: 0 } }], log: {} } });
    assert.equal(r.status, 400); assert.equal((await r.json()).code, 'INVALID_VOW_REMINDER');
    const state = { lang: 'en', goal: 16, log: {}, vows: [vow('v2', 18, 0), vow('v3', 18, 30, { reminder: { enabled: false, hour: 18, minute: 30 } }), { id: 'old', t: 'Old vow without reminder field', on: true }, vow('c1', 18, 0, { core: true })] };
    r = await call('PUT', '/api/kartik', { revision: 0, state, tz: 'America/New_York' }); assert.equal(r.status, 200); assert.equal((await r.json()).revision, 1);
    const got = await (await call('GET', '/api/kartik')).json();
    assert.deepEqual(got.state.vows.find(v => v.id === 'v2').reminder, { enabled: true, hour: 18, minute: 0 });
    assert.equal(got.state.vows.find(v => v.id === 'old').reminder, undefined, 'older vows are stored untouched');
    assert.equal((await KartikAlert.findOne({ userId: user._id }).lean()).tz, 'America/New_York', 'time zone kept for the scheduler');
    r = await call('PUT', '/api/kartik', { revision: 1, state, tz: 'Mars/Base' }); assert.equal(r.status, 200);
    assert.equal((await KartikAlert.findOne({ userId: user._id }).lean()).tz, 'America/New_York', 'invalid time zone ignored');
  });

  await t.test('global alert endpoints still work', async () => {
    let r = await call('PUT', '/api/kartik/alerts', { enabled: true, hour: 18, minute: 0, tz: 'America/New_York' }); assert.equal(r.status, 200);
    const j = await (await call('GET', '/api/kartik/alerts')).json(); assert.equal(j.enabled, true); assert.equal(j.configured, true); assert.equal(j.devices, 1);
    r = await call('POST', '/api/kartik/alerts/test'); assert.equal(r.status, 200); assert.equal(sent.pop().tag, 'kartik-test');
  });

  // New York user: 18:xx local on 27 Oct 2026 = 22:xx UTC; India date is already 28 Oct 03:xx → Day 3 (index 2)
  const ny = (day, h, m) => new Date(Date.UTC(2026, 9, day, h + 4, m)); // EDT = UTC-4 until 1 Nov
  await t.test('individual + global reminders at the same time: separate vows, no vow notified twice', async () => {
    sent.length = 0; const stats = await I.sweepAll(ny(27, 18, 1));
    assert.deepEqual([stats.vowDue, stats.vowSent, stats.sent], [2, 1, 1]);
    assert.equal(sent.length, 2);
    const vowMsg = sent.find(m => m.tag.startsWith('kartik-vow')); const globalMsg = sent.find(m => m.tag.startsWith('kartik-reminder'));
    assert.match(vowMsg.body, /2 vows are due now/); assert.ok(vowMsg.body.includes('Vow v2') && vowMsg.body.includes('Vow c1'));
    assert.ok(globalMsg.body.includes('Vow v3') && globalMsg.body.includes('Old vow') && !globalMsg.body.includes('Vow v2') && !globalMsg.body.includes('Vow c1'), globalMsg.body);
    assert.match(vowMsg.title, /Day 3/);
  });
  await t.test('repeat sweeps the same day send nothing (also after a restart: dedupe is stored in MongoDB)', async () => {
    sent.length = 0; for (const [h, m] of [[18, 2], [18, 30], [18, 59]]) await I.sweepAll(ny(27, h, m));
    assert.equal(sent.length, 0);
    const a = await KartikAlert.findOne({ userId: user._id }).lean(); assert.equal(a.vowSent.v2, '2026-10-27'); assert.equal(a.vowSent.c1, '2026-10-27');
  });
  await t.test('the next local day fires again', async () => {
    sent.length = 0; await I.sweepAll(ny(28, 18, 3)); assert.equal(sent.filter(m => m.tag.startsWith('kartik-vow')).length, 1);
  });
  await t.test('completed or inactive vows are skipped; one vow completing does not affect the other', async () => {
    const doc = await KartikState.findOne({ userId: user._id }); const data = JSON.parse(JSON.stringify(doc.data));
    data.log = { 4: { done: ['v2'], rounds: 0, note: '' } }; // 29 Oct 18:05 New York = 30 Oct 03:35 India = Day 5 (index 4)
    data.vows.find(v => v.id === 'c1').on = false; await KartikState.updateOne({ _id: doc._id }, { $set: { data } });
    sent.length = 0; await I.sweepVowReminders(ny(29, 18, 5)); assert.equal(sent.length, 0, 'v2 completed, c1 inactive');
    data.log = {}; await KartikState.updateOne({ _id: doc._id }, { $set: { data } });
    sent.length = 0; await I.sweepVowReminders(ny(29, 18, 6)); assert.equal(sent.length, 1); assert.ok(sent[0].body.includes('Vow v2') && !sent[0].body.includes('Vow c1'));
  });
  await t.test('nothing is sent before 26 Oct or after 24 Nov (India calendar)', async () => {
    sent.length = 0;
    for (const d of [IST(2026, 10, 25, 23, 0), IST(2026, 11, 25, 12, 0)]) { const s = await I.sweepAll(d); assert.ok(s.outsideJourney); }
    assert.equal(sent.length, 0);
  });
  await t.test('temporary push failure is retried next minute; expired subscription is removed', async () => {
    const doc = await KartikState.findOne({ userId: user._id }); const data = JSON.parse(JSON.stringify(doc.data)); data.vows.find(v => v.id === 'c1').on = true; data.log = {};
    await KartikState.updateOne({ _id: doc._id }, { $set: { data } });
    sent.length = 0; failWith = 503; await I.sweepVowReminders(ny(30, 18, 2)); assert.equal(sent.length, 0);
    failWith = null; await I.sweepVowReminders(ny(30, 18, 3)); assert.equal(sent.length, 1, 'retried and delivered once');
    sent.length = 0; await I.sweepVowReminders(ny(30, 18, 4)); assert.equal(sent.length, 0, 'no duplicate after the retry');
    failWith = 410; await I.sweepVowReminders(ny(31, 18, 2)); failWith = null;
    assert.equal(await PushSubscription.countDocuments({ userId: user._id }), 0, 'gone subscription deleted');
  });
  await t.test('user without any individual reminder: global behaviour unchanged', async () => {
    const other = await User.create({ googleId: 'g-2', email: 'two@example.com', name: 'Two' });
    await KartikState.create({ userId: other._id, revision: 1, data: { lang: 'en', log: {}, vows: [{ id: 'v0', t: 'Plain', on: true }] } });
    await KartikAlert.create({ userId: other._id, enabled: true, hour: 18, minute: 0, tz: 'Asia/Kolkata' });
    await PushSubscription.create({ userId: other._id, endpoint: 'https://fcm.googleapis.com/fcm/send/dev-2', keys: { p256dh: 'p', auth: 'a' }, app: 'kartik' });
    sent.length = 0; const s = await I.sweepAll(IST(2026, 10, 27, 18, 5));
    assert.equal(sent.length, 1); assert.match(sent[0].body, /1 of 1 vows are still incomplete today: Plain/); assert.equal(s.vowDue, 0);
    sent.length = 0; await I.sweepAll(IST(2026, 10, 27, 18, 6)); assert.equal(sent.length, 0);
  });
});
