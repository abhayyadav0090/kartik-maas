# Standalone Kartik service — deployment guide

## Architecture
This repository is a complete Node/Express service. It serves the tracker and its APIs from the same origin. It uses the existing MongoDB cluster and the existing `User` and `KartikState` collections, so do not delete or reset MongoDB. NexOS has its own backend and no tracker APIs or reminder scheduler.

## Render setup
1. Back up both GitHub repositories before replacing files.
2. In the existing Kartik Render service, confirm whether it is a **Web Service**. This ZIP needs a Node Web Service (build `npm install`, start `npm start`). If the current service is a Static Site, create a new Web Service from this repo first; only switch the public URL after testing the new service.
3. Set `MONGO_URI` to the exact existing MongoDB connection string. Do not create a new database.
4. Set `GOOGLE_CLIENT_ID` to the same OAuth client used by the current sign-in. In Google Cloud OAuth settings, add `https://kartik-maas.onrender.com` as an authorized JavaScript origin if it is not already there.
5. Set `JWT_SECRET` to a long random secret. This service has its own cookie/token signing secret; it does not need to match NexOS.
6. Generate one VAPID key pair and set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` on this service only. Never put the private key in frontend files or GitHub.
7. Set `KARTIK_CRON_KEY` to a long random secret.
8. Deploy and test `/api/health`, Google sign-in, existing vow data, and the test notification before switching any production domain.

## Reliable scheduled reminders
Render free services can sleep, so use https://cron-job.org to call this endpoint every 5 minutes:
`https://kartik-maas.onrender.com/api/kartik/alerts/tick?key=YOUR_KARTIK_CRON_KEY`
Method: GET. Keep the key private. The scheduler sends a notification only during the 30-day journey (27 Oct–25 Nov 2026, India calendar) when at least one enabled vow is incomplete. It makes a database claim to avoid duplicate daily sends. The external cron must remain enabled; if it stops, scheduled reminders may stop.

## Test
1. Sign in on the live Kartik site.
2. Enable notifications and allow browser notifications.
3. Confirm the test notification arrives.
4. To test the scheduled flow before the journey, temporarily set `KARTIK_ALERTS_ANYDAY=1`, choose a reminder time a few minutes ahead, and leave a vow incomplete. Remove the variable or set it to `0` before the journey.

## Preserve the old URL
The old path `https://ai-aqit.onrender.com/kartik` can be preserved with NexOS's generic legacy redirect configuration: set `LEGACY_REDIRECTS_JSON` to `{"/kartik":"https://kartik-maas.onrender.com/kartik"}` in the NexOS Render environment. This is only a generic redirect mapping; NexOS does not host or run the tracker.

## Important safety
Do not delete MongoDB collections. Do not publish `.env` or secrets. Keep both original ZIPs as backups until both live services pass testing.
