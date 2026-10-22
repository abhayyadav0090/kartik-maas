require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, 'site');
const isProd = process.env.NODE_ENV === 'production';
const LOGIN_DAYS = 35; // stay signed in for the whole 30-day Kartik journey (plus a few spare days)
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
    frameSrc: ['https://accounts.google.com'], scriptSrcAttr: ["'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    fontSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    connectSrc: ["'self'", 'https://accounts.google.com'], imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  } },
}));
app.use(compression());
app.use(morgan((tokens, req, res) => [
  tokens.method(req, res), String(req.originalUrl || req.url).split('?')[0], tokens.status(req, res),
  tokens.res(req, res, 'content-length') || '-', '-', `${tokens['response-time'](req, res)} ms`,
].join(' ')));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

let dbPromise = null;
function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!process.env.MONGO_URI) return Promise.reject(new Error('MONGO_URI is not configured'));
  if (!dbPromise) dbPromise = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('MongoDB connected'))
    .catch(err => { dbPromise = null; throw err; });
  return dbPromise;
}
app.use(['/api/auth', '/api/me', '/api/kartik', '/api/push'], async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { console.error('Database connection failed:', err.message); res.status(503).json({ error: 'Database unavailable' }); }
});

// These model names/collections intentionally match the existing database so existing progress is preserved.
const User = mongoose.model('User', new mongoose.Schema({
  googleId: { type: String, unique: true, index: true }, email: String, name: String,
  nameCustom: { type: Boolean, default: false }, picture: String,
}, { timestamps: true }));
const KartikState = mongoose.model('KartikState', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }, revision: { type: Number, default: 0 },
}, { timestamps: true, minimize: false }));
const pushSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  endpoint: { type: String, unique: true, index: true, required: true },
  keys: { p256dh: { type: String, required: true }, auth: { type: String, required: true } },
  app: { type: String, enum: ['kartik'], default: 'kartik', index: true },
  lastSeenAt: { type: Date, default: Date.now },
}, { timestamps: true, minimize: false });
pushSchema.index({ userId: 1, updatedAt: -1 });
const PushSubscription = mongoose.model('PushSubscription', pushSchema);
const KartikAlert = mongoose.model('KartikAlert', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
  enabled: { type: Boolean, default: false }, hour: { type: Number, default: 18, min: 0, max: 23 },
  minute: { type: Number, default: 0, min: 0, max: 59 }, tz: { type: String, default: 'Asia/Kolkata' },
  lastSentFor: { type: String, default: '' },
}, { timestamps: true }));
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
async function requireAuth(req, res, next) {
  let id;
  try { id = jwt.verify(req.cookies.token, process.env.JWT_SECRET).id; }
  catch (_) { return res.status(401).json({ error: 'Not logged in' }); }
  try {
    if (!(await User.exists({ _id: id }))) { res.clearCookie('token'); return res.status(401).json({ error: 'Not logged in' }); }
  } catch (err) { console.error('Auth check failed:', err.message); return res.status(503).json({ error: 'Database unavailable' }); }
  req.userId = id; next();
}
app.get('/api/config', (req, res) => res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' }));
app.post('/api/auth/google', wrap(async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) return res.status(503).json({ error: 'Google sign-in is not configured.' });
  const credential = req.body && req.body.credential;
  if (typeof credential !== 'string' || !credential) return res.status(400).json({ error: 'credential required' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) return res.status(401).json({ error: 'Email not verified' });
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) user = new User({ googleId: payload.sub });
    user.email = payload.email; user.picture = payload.picture;
    if (!user.nameCustom) user.name = payload.name;
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: `${LOGIN_DAYS}d` });
    res.cookie('token', token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: LOGIN_DAYS * 86400000 });
    res.json({ name: user.name, email: user.email, picture: user.picture });
  } catch (err) { console.warn('Google sign-in failed:', err.message); res.status(401).json({ error: 'Google login failed' }); }
}));
app.post('/api/auth/logout', (req, res) => { res.clearCookie('token', { path: '/' }); res.json({ ok: true }); });
app.get('/api/me', requireAuth, wrap(async (req, res) => {
  const user = await User.findById(req.userId).select('name email picture');
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json(user);
}));
app.put('/api/me', requireAuth, wrap(async (req, res) => {
  const raw = req.body && req.body.name;
  const name = typeof raw === 'string' ? raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim() : '';
  if (!name || name.length > 60) return res.status(400).json({ error: 'Enter a name of 1–60 characters.' });
  const user = await User.findByIdAndUpdate(req.userId, { name, nameCustom: true }, { new: true }).select('name email picture');
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json({ name: user.name, email: user.email, picture: user.picture });
}));

const KARTIK_START_UTC = Date.UTC(2026, 9, 26); // Day 1 = 26 Oct 2026 (India calendar)
function dayIndexIndia() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date()).reduce((o, x) => { if (x.type !== 'literal') o[x.type] = Number(x.value); return o; }, {});
  return Math.floor((Date.UTC(p.year, p.month - 1, p.day) - KARTIK_START_UTC) / 86400000);
}
function hasMeaningfulLog(entry) { return !!entry && typeof entry === 'object' && ((Array.isArray(entry.done) && entry.done.length) || Number(entry.rounds) > 0 || (typeof entry.note === 'string' && entry.note.trim())); }
function comparableLog(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const done = Array.isArray(entry.done) ? [...new Set(entry.done.map(String))].sort() : [];
  const rounds = Math.max(0, Number(entry.rounds) || 0); const note = typeof entry.note === 'string' ? entry.note : '';
  return done.length || rounds || note.trim() ? { done, rounds, note } : null;
}
function changedFutureDay(next, current) {
  const today = dayIndexIndia(); const lastEditable = today < 0 ? 0 : Math.min(today, 29);
  const nextLog = next.log && typeof next.log === 'object' ? next.log : {};
  const oldLog = current && current.log && typeof current.log === 'object' ? current.log : {};
  for (let i = lastEditable + 1; i < 30; i++) if (hasMeaningfulLog(nextLog[String(i)]) && JSON.stringify(comparableLog(nextLog[String(i)])) !== JSON.stringify(comparableLog(oldLog[String(i)]))) return i;
  return -1;
}
app.get('/api/kartik', requireAuth, wrap(async (req, res) => {
  const doc = await KartikState.findOne({ userId: req.userId });
  res.json({ state: doc ? doc.data : null, revision: doc ? (doc.revision || 0) : 0 });
}));
app.put('/api/kartik', requireAuth, wrap(async (req, res) => {
  const { state, revision } = req.body || {};
  if (!state || typeof state !== 'object' || Array.isArray(state) || !Array.isArray(state.vows) || state.vows.length > 60) return res.status(400).json({ error: 'valid state required' });
  if (!Number.isSafeInteger(revision) || revision < 0) return res.status(428).json({ error: 'Reload the tracker before saving.', code: 'REVISION_REQUIRED' });
  const existing = await KartikState.findOne({ userId: req.userId }).select('data revision');
  const actual = existing ? (existing.revision || 0) : 0;
  if (actual !== revision) return res.status(409).json({ error: 'This tracker was updated on another device. Reload the latest progress before saving again.', code: 'REVISION_CONFLICT', state: existing ? existing.data : null, revision: actual });
  const future = changedFutureDay(state, existing ? existing.data : null);
  if (future !== -1) return res.status(400).json({ error: `Day ${future + 1} is not editable yet.`, code: 'FUTURE_DAY_LOCKED', day: future + 1 });
  let updated = null; const nextRevision = revision + 1;
  if (revision === 0) {
    updated = await KartikState.findOneAndUpdate({ userId: req.userId, $or: [{ revision: 0 }, { revision: { $exists: false } }] }, { $set: { data: state, revision: nextRevision } }, { new: true });
    if (!updated) { try { updated = await KartikState.create({ userId: req.userId, data: state, revision: nextRevision }); } catch (err) { if (err.code !== 11000) throw err; } }
  } else updated = await KartikState.findOneAndUpdate({ userId: req.userId, revision }, { $set: { data: state, revision: nextRevision } }, { new: true });
  if (!updated) { const latest = await KartikState.findOne({ userId: req.userId }).select('data revision'); return res.status(409).json({ error: 'This tracker was updated on another device. Reload the latest progress before saving again.', code: 'REVISION_CONFLICT', state: latest ? latest.data : null, revision: latest ? (latest.revision || 0) : 0 }); }
  res.json({ ok: true, revision: updated.revision || nextRevision });
}));

const VAPID_PUBLIC_KEY = (process.env.VAPID_PUBLIC_KEY || '').trim();
const VAPID_PRIVATE_KEY = (process.env.VAPID_PRIVATE_KEY || '').trim();
const VAPID_SUBJECT = (process.env.VAPID_SUBJECT || 'mailto:admin@example.com').trim();
const pushConfigured = () => Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);
if (pushConfigured()) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
function validTimeZone(tz) { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (_) { return false; } }
function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
    .reduce((o, x) => { if (x.type !== 'literal') o[x.type] = Number(x.value); return o; }, {});
  return { y: parts.year, m: parts.month, d: parts.day, h: parts.hour, min: parts.minute };
}
const dateKey = p => `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
function greeting(state) { const hi = state && state.lang === 'hi'; if (state && state.addr === 'mataji') return hi ? 'हरे कृष्ण माता जी' : 'Hare Krishna Mataji'; if (state && state.addr === 'prabhu') return hi ? 'हरे कृष्ण प्रभु जी' : 'Hare Krishna Prabhu'; return hi ? 'हरे कृष्ण' : 'Hare Krishna'; }
function reminderPayload(state, dayIdx) {
  const st = state && typeof state === 'object' ? state : {};
  const vows = (Array.isArray(st.vows) ? st.vows : []).filter(v => v && v.on !== false && typeof v.id === 'string');
  if (!vows.length) return null;
  const log = st.log && st.log[dayIdx]; const done = new Set(Array.isArray(log && log.done) ? log.done : []);
  const pending = vows.filter(v => !done.has(v.id)).sort((a,b) => (b.core ? 1 : 0) - (a.core ? 1 : 0));
  if (!pending.length) return null;
  const hi = st.lang === 'hi'; const names = pending.slice(0, 3).map(v => String(v.t || '').slice(0, 42)).filter(Boolean).join(', '); const more = pending.length > 3 ? '…' : '';
  return { title: hi ? `🪔 ${greeting(st)} — दिन ${dayIdx + 1} के व्रत शेष हैं` : `🪔 ${greeting(st)} — Day ${dayIdx + 1} vows pending`, body: hi ? `आज ${vows.length} में से ${pending.length} व्रत अभी पूरे नहीं हुए${names ? ': ' + names + more : ''}। विश्राम से पहले इन्हें पूरा करें।` : `${pending.length} of ${vows.length} vows are still incomplete today${names ? ': ' + names + more : ''}. Please complete them before you rest.`, url: '/kartik', tag: `kartik-reminder-${dayIdx + 1}`, kind: 'kartik' };
}
function alertView(a, devices) { return { configured: pushConfigured(), enabled: Boolean(a && a.enabled), hour: a ? a.hour : 18, minute: a ? a.minute : 0, tz: a ? a.tz : 'Asia/Kolkata', devices }; }
app.get('/api/push/config', (req, res) => res.json({ enabled: pushConfigured(), publicKey: pushConfigured() ? VAPID_PUBLIC_KEY : '' }));
app.post('/api/push/subscribe', requireAuth, wrap(async (req, res) => {
  if (!pushConfigured()) return res.status(503).json({ error: 'Reminders are not configured yet.', code: 'PUSH_NOT_CONFIGURED' });
  const sub = req.body && req.body.subscription;
  if (!sub || typeof sub.endpoint !== 'string' || !sub.keys || typeof sub.keys.p256dh !== 'string' || typeof sub.keys.auth !== 'string') return res.status(400).json({ error: 'A valid browser push subscription is required.' });
  let endpoint; try { endpoint = new URL(sub.endpoint); } catch (_) { return res.status(400).json({ error: 'Invalid push endpoint.' }); }
  const host = endpoint.hostname.toLowerCase(); const supported = host === 'fcm.googleapis.com' || host.endsWith('.push.services.mozilla.com') || host === 'push.services.mozilla.com' || host.endsWith('.notify.windows.com') || host === 'web.push.apple.com' || host.endsWith('.push.apple.com');
  if (endpoint.protocol !== 'https:' || !supported) return res.status(400).json({ error: 'Unsupported push service endpoint.' });
  await PushSubscription.findOneAndUpdate({ endpoint: endpoint.href }, { $set: { userId: req.userId, endpoint: endpoint.href, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }, app: 'kartik', lastSeenAt: new Date() } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  res.json({ ok: true });
}));
app.delete('/api/push/subscribe', requireAuth, wrap(async (req, res) => {
  const endpoint = req.body && req.body.endpoint; if (typeof endpoint !== 'string') return res.status(400).json({ error: 'Subscription endpoint required.' });
  await PushSubscription.deleteOne({ userId: req.userId, endpoint, app: 'kartik' }); res.json({ ok: true });
}));
app.get('/api/kartik/alerts', requireAuth, wrap(async (req, res) => {
  const [a, devices] = await Promise.all([KartikAlert.findOne({ userId: req.userId }).lean(), PushSubscription.countDocuments({ userId: req.userId, app: 'kartik' })]);
  res.json(alertView(a, devices));
}));
app.put('/api/kartik/alerts', requireAuth, wrap(async (req, res) => {
  const { enabled, hour, minute, tz } = req.body || {};
  if (typeof enabled !== 'boolean' || !Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59 || typeof tz !== 'string' || tz.length > 64 || !validTimeZone(tz)) return res.status(400).json({ error: 'Valid enabled, hour, minute and time zone are required.' });
  const a = await KartikAlert.findOneAndUpdate({ userId: req.userId }, { $set: { enabled, hour, minute, tz } }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }).lean();
  res.json(alertView(a, await PushSubscription.countDocuments({ userId: req.userId, app: 'kartik' })));
}));
app.post('/api/kartik/alerts/test', requireAuth, wrap(async (req, res) => {
  if (!pushConfigured()) return res.status(503).json({ error: 'Reminders are not configured on the server yet.', code: 'PUSH_NOT_CONFIGURED' });
  const [subs, a, st] = await Promise.all([PushSubscription.find({ userId: req.userId, app: 'kartik' }), KartikAlert.findOne({ userId: req.userId }).lean(), KartikState.findOne({ userId: req.userId }).select('data').lean()]);
  if (!subs.length) return res.status(404).json({ error: 'This device is not subscribed yet. Turn reminders off and on again.' });
  const state = st && st.data || {}; const when = `${((a ? a.hour : 18) + 11) % 12 + 1}:${String(a ? a.minute : 0).padStart(2, '0')} ${(a ? a.hour : 18) < 12 ? 'AM' : 'PM'}`; const hi = state.lang === 'hi';
  const payload = { title: hi ? `🔔 ${greeting(state)} — रिमाइंडर चालू हो गया` : `🔔 ${greeting(state)} — reminders are ON`, body: hi ? `परीक्षण सफल रहा। यदि आज कोई व्रत अधूरा होगा, तो ${when} पर रिमाइंडर मिलेगा।` : `Test successful. If any vow is incomplete, you will get a reminder at ${when}.`, url: '/kartik', tag: 'kartik-test', kind: 'kartik' };
  let delivered = 0;
  for (const sub of subs) { try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload), { TTL: 600, urgency: 'high' }); delivered++; } catch (err) { if (err.statusCode === 404 || err.statusCode === 410) await PushSubscription.deleteOne({ _id: sub._id }); else console.warn('Test push failed:', err.message); } }
  if (!delivered) return res.status(502).json({ error: 'The push service rejected the test. Turn reminders off and on again.' });
  res.json({ ok: true, delivered });
}));
let sweepRunning = false;
async function sweepAlerts() {
  if (!pushConfigured() || mongoose.connection.readyState !== 1 || sweepRunning) return { skipped: true };
  sweepRunning = true; const stats = { due: 0, sent: 0, complete: 0 };
  try {
    const now = new Date(); let dayIdx = dayIndexIndia(); if (process.env.KARTIK_ALERTS_ANYDAY === '1' && (dayIdx < 0 || dayIdx > 29)) dayIdx = 0;
    if (dayIdx < 0 || dayIdx > 29) return { ...stats, outsideJourney: true };
    const alerts = await KartikAlert.find({ enabled: true }).lean();
    for (const a of alerts) {
      const tz = validTimeZone(a.tz) ? a.tz : 'Asia/Kolkata'; const p = zonedParts(now, tz); const key = dateKey(p); const nowMin = p.h * 60 + p.min; const dueMin = a.hour * 60 + a.minute;
      if (nowMin < dueMin || nowMin >= dueMin + 240 || a.lastSentFor === key) continue;
      const claimed = await KartikAlert.findOneAndUpdate({ _id: a._id, enabled: true, lastSentFor: { $ne: key } }, { $set: { lastSentFor: key } }, { new: false });
      if (!claimed) continue; stats.due++;
      try {
        const st = await KartikState.findOne({ userId: a.userId }).select('data').lean(); const payload = reminderPayload(st && st.data, dayIdx);
        if (!payload) { stats.complete++; continue; }
        const subs = await PushSubscription.find({ userId: a.userId, app: 'kartik' }); let delivered = 0; let transient = false;
        for (const sub of subs) { try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload), { TTL: 7200, urgency: 'high' }); delivered++; } catch (err) { if (err.statusCode === 404 || err.statusCode === 410) await PushSubscription.deleteOne({ _id: sub._id }); else { if (!err.statusCode || err.statusCode >= 500 || err.statusCode === 429) transient = true; console.warn('Reminder push failed:', err.message); } } }
        if (delivered) stats.sent++; else if (transient) await KartikAlert.updateOne({ _id: a._id, lastSentFor: key }, { $set: { lastSentFor: claimed.lastSentFor || '' } });
      } catch (err) { console.warn('Reminder processing failed:', err.message); await KartikAlert.updateOne({ _id: a._id, lastSentFor: key }, { $set: { lastSentFor: claimed.lastSentFor || '' } }).catch(() => {}); }
    }
  } finally { sweepRunning = false; }
  return stats;
}
// Reliable reminder checks while the web service process is running.
// UptimeRobot should request /api/health every 5 minutes on the Render Free plan.
// The scheduler checks every minute; all day calculations use the India calendar.
let alertSchedulerStarted = false;
let alertSchedulerRuns = 0;
function startAlertScheduler() {
  if (alertSchedulerStarted) return;
  alertSchedulerStarted = true;
  console.log('[Kartik scheduler] started: one-minute checks; journey 26 Oct–24 Nov 2026 (Asia/Kolkata)');
  const run = async () => {
    alertSchedulerRuns += 1;
    try {
      if (!pushConfigured()) {
        if (alertSchedulerRuns === 1 || alertSchedulerRuns % 5 === 0) {
          console.warn('[Kartik scheduler] skipped: VAPID keys are not configured');
        }
        return;
      }
      await connectDB();
      const stats = await sweepAlerts();
      // Log every five minutes as well as any meaningful due/send/result event.
      if (alertSchedulerRuns % 5 === 1 || stats.due || stats.sent || stats.complete || stats.skipped) {
        console.log(`[Kartik scheduler] ${new Date().toISOString()} ${JSON.stringify(stats)}`);
      }
    } catch (err) {
      console.error('[Kartik scheduler] check failed:', err && err.message ? err.message : err);
    }
  };
  void run();
  setInterval(run, 60 * 1000);
}

app.all('/api/kartik/alerts/tick', wrap(async (req, res) => {
  const secret = String(process.env.KARTIK_CRON_KEY || ''); const given = String(req.get('x-cron-key') || ''); // header only: never put the secret in the URL
  const a = Buffer.from(secret); const b = Buffer.from(given);
  if (!secret || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(403).json({ error: 'Forbidden' });
  res.json({ ok: true, at: new Date().toISOString(), ...(await sweepAlerts()) });
}));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'kartik', timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.redirect(302, '/kartik'));
app.get('/kartik', (req, res) => res.sendFile(path.join(SITE_DIR, 'kartik.html')));
app.use(express.static(SITE_DIR, { maxAge: isProd ? '1h' : 0, etag: true }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { console.error('Request error:', err); if (res.headersSent) return next(err); res.status(500).json({ error: 'Something went wrong.' }); });

if (require.main === module) app.listen(PORT, () => { console.log(`Kartik service listening on ${PORT}`); startAlertScheduler(); });
module.exports = app;
