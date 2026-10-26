# Damodar Vows — Kartik Maas Tracker

This repository is the **standalone Kartik application**: frontend, Express backend, Google sign-in, MongoDB persistence, and Web Push reminders. It does not depend on the NexOS backend.

- Main page: `/kartik`
- Health check: `/api/health`
- Server: `server.js`
- Frontend markup: `site/kartik.html`
- Stylesheet: `site/kartik.css`
- JavaScript: `site/kartik.js`
- Assets and service worker: `site/`
- WhatsApp/link-preview image: `site/kartik-share-26-oct-2026.png` (1200 × 630)
- Notification examples: `NOTIFICATION-PREVIEW.md`

Set the environment variables listed in `.env.example` in Render. Follow [`SETUP-REMINDERS.md`](SETUP-REMINDERS.md) before deploying. The service deliberately reuses the existing `User` and `KartikState` MongoDB collections to preserve existing progress.


**Calendar version:** 26 October–24 November 2026. Reminder checks run in-process once per minute while the Render web service is running; use UptimeRobot on `/api/health` to provide periodic inbound traffic, but note Render Free uptime and shared-instance-hour limitations. See `SETUP-REMINDERS.md`.

## Reliability and accessibility improvements

- Reminder time preferences are saved even when reminders are temporarily turned off.
- The reminder card explains the 26 Oct–24 Nov 2026 date window and device-controlled notification sound.
- Status updates are announced to assistive technology.
- Floating shloka animations respect the operating system's reduced-motion preference, and the timer runs less often to reduce unnecessary layout work on phones.
- Social-preview metadata includes image alternative text; CSS and JavaScript URLs are versioned to help browsers fetch the latest deployed files.
- Run `npm test` to perform offline smoke checks of the release files.

## 1.2.0
- Four tabs: Home, Daily, My Vows, Analysis (deep links `/kartik#home`, `#daily`, `#vows`, `#analysis`).
- Individual vow reminders next to the global reminder; see `SETUP-REMINDERS.md`.
- Testing mode, the Day 1 test banner and the clear-test button were removed. Run `npm test` (set `KARTIK_TEST_MONGO_URI` to include the MongoDB integration test).
