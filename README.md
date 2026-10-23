# Damodar Vows — Kartik Maas Tracker (release 1.1.1)

This repository is the **standalone Kartik application**: responsive frontend, Express backend, Google sign-in, MongoDB persistence, and Web Push reminders. It does not use another app’s backend.

## Main files

- Main page: `/kartik`
- Health endpoint: `/api/health`
- Backend: `server.js`
- HTML: `site/kartik.html`
- CSS: `site/kartik.css`
- Browser logic: `site/kartik.js`
- Push service worker: `site/sw.js`
- Assets: `site/kartik-assets/`
- WhatsApp/social preview: `site/kartik-share-26-oct-2026.png` (1200 × 630)
- Reminder samples: `NOTIFICATION-PREVIEW.md`
- Deployment notes: `SETUP-REMINDERS.md`

## Journey dates

**Day 1: 26 October 2026. Day 30: 24 November 2026 (Asia/Kolkata).** Frontend labels and backend reminder date checks use the same India calendar. The first day can be tested before the journey starts; future days stay locked.

## Features

- Google sign-in; persistent per-account vows and progress in the existing MongoDB collections.
- English and Hindi interface; optional light/dark appearance.
- Daily vows, editable/custom vows, priority vows, japa rounds, reflection, progress charts, backup export/import, and conflict warnings when another device saves newer progress. Kartik Purnima is labelled on Day 30 (24 November). Kartik Purnima is labelled on Day 30 (24 November).
- Installable PWA, link sharing and Web Push reminders.
- Responsive layouts, visible keyboard focus, keyboard-operable tabs, reduced-motion support, live status announcements, and a saved light/dark theme.

## Render configuration

Keep the **existing** Render environment values for `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`. `.env.example` contains placeholders only; never upload real secrets. The backend intentionally continues using the existing `User`, `KartikState`, `KartikAlert`, and `PushSubscription` model/collection names so users’ progress and subscriptions are not reset.

Render build command: `npm install`  
Render start command: `npm start`  
Health endpoint: `https://kartik-maas.onrender.com/api/health`

## Important: Render Free and reminder reliability

The in-process one-minute reminder scheduler runs **only while the web-service process is running**. A sleeping or suspended Render Free service cannot execute it, so an exact-time push reminder is not guaranteed on a sleeping instance. A monitor ping every five minutes can keep a Free service awake, but an always-awake service can use about 720 instance-hours in a 30-day month. Render’s included Free instance-hours are shared across services in the workspace, so this may exhaust the quota if other Free services use the same pool. Choose this trade-off deliberately; do not assume a health check guarantees reminder delivery.

See [`SETUP-REMINDERS.md`](SETUP-REMINDERS.md) for the deployment checks and scheduler options.

## Local checks

Run `npm test` after installing dependencies. The suite checks JavaScript syntax, journey dates, social-preview assets, environment-template hygiene, PWA wiring, reminder-time handling, and basic server endpoints. These tests do not replace a production sign-in, push, or MongoDB end-to-end test.
