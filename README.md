# Damodar Vows — Kartik Maas Tracker

This repository is the **standalone Kartik application**: frontend, Express backend, Google sign-in, MongoDB persistence, and Web Push reminders. It does not depend on the NexOS backend.

- Main page: `/kartik`
- Health check: `/api/health`
- Server: `server.js`
- Frontend: `site/kartik.html`
- Assets and service worker: `site/`

Set the environment variables listed in `.env.example` in Render. Follow [`SETUP-REMINDERS.md`](SETUP-REMINDERS.md) before deploying. The service deliberately reuses the existing `User` and `KartikState` MongoDB collections to preserve existing progress.
