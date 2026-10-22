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
